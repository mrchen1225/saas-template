import * as tf from '@tensorflow/tfjs';

// // Ensure initialization only once
// if (!global.tfInitialized) {
//   // Set platform
//   tf.setBackend('cpu');
//   // Mark as initialized
//   global.tfInitialized = true;
// }

tf.ENV.set('WEBGL_PACK', false);  // This needs to be kept, otherwise it may run slowly in some versions

let styleNet, transformNet;

async function loadModels() {
  if (!styleNet || !transformNet) {
    try {
      console.log('Loading style model...');
      styleNet = await tf.loadGraphModel('https://models.aidisturbance.online/models/saved_model_style_js/model.json', {
        requestInit: {
          mode: 'cors',
          credentials: 'omit'
        }
      });
      console.log('Style model loaded successfully');

      console.log('Loading transform model...');
      transformNet = await tf.loadGraphModel('https://models.aidisturbance.online/models/saved_model_transformer_separable_js/model.json', {
        requestInit: {
          mode: 'cors',
          credentials: 'omit'
        }
      });
      console.log('Transform model loaded successfully');
    } catch (error) {
      console.error('Error loading models:', error);
      throw new Error('Failed to load TensorFlow models');
    }
  }
}

// Modified resizeImageIfNeeded function
function resizeImageIfNeeded(image, maxSize = 2048) {
  const canvas = document.createElement('canvas');
  let width = image.width;
  let height = image.height;

  // Calculate scale ratio
  const scale = Math.min(1, maxSize / Math.max(width, height));

  // Apply scaling
  width = Math.floor(width * scale);
  height = Math.floor(height * scale);

  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').drawImage(image, 0, 0, width, height);
  return canvas;
}

export async function generateTexture(contentImage, styleImage, styleRatio = 1.0) {
  console.log('contentImage: ', contentImage);
  console.log('styleImage: ', styleImage);
  console.log('styleRatio: ', styleRatio);

  await loadModels();

  try {
    console.log('Processing image...');
    
    // Resize images using smaller maximum size
    const resizedContentImage = resizeImageIfNeeded(contentImage, 1024);
    const resizedStyleImage = resizeImageIfNeeded(styleImage, 1024);
    
    // Create tensors using resized images
    const contentTensor = tf.browser.fromPixels(resizedContentImage).toFloat().div(tf.scalar(255)).expandDims();
    const styleTensor = tf.browser.fromPixels(resizedStyleImage).toFloat().div(tf.scalar(255)).expandDims();

    const styleBottleneck = await tf.tidy(() => styleNet.predict(styleTensor));
    const identityBottleneck = await tf.tidy(() => styleNet.predict(contentTensor));

    const combinedBottleneck = await tf.tidy(() => {
      const styleBottleneckScaled = styleBottleneck.mul(tf.scalar(styleRatio));
      const identityBottleneckScaled = identityBottleneck.mul(tf.scalar(1.0 - styleRatio));
      return styleBottleneckScaled.add(identityBottleneckScaled);
    });

    const stylized = await tf.tidy(() => 
      transformNet.predict([contentTensor, combinedBottleneck]).squeeze()
    );

    const textureCanvas = document.createElement('canvas');
    textureCanvas.width = resizedContentImage.width;
    textureCanvas.height = resizedContentImage.height;
    
    await tf.browser.toPixels(stylized, textureCanvas);

    // Clean up resources
    [styleBottleneck, identityBottleneck, combinedBottleneck, stylized].forEach(t => t.dispose());
    console.log('Image processing complete');
    return textureCanvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error('Failed to process image');
  }
}
