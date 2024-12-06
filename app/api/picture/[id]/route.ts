import { updatePictureDescription, findPictureById, updatePictureUserId, deletePictureByUserIdAndPictureId } from "@/database/pictureRepo";
import { PictureStatus } from "@/prisma/enums";
import { Picture } from "@/prisma/types";
import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest, { params }: { params: { id: string } },) {
  const { userId } = auth();
  const id = params.id || "";
  console.log(id)
  const pictureInfo = await findPictureById(id);

  if (userId === 'user_2lTLLoLn4I4sxz0l1ruSlYr4pwS') {
    return new Response(JSON.stringify(pictureInfo), { status: 200 });
  }

  if (userId !== null) {
    if (pictureInfo?.userId === 'anonymous') {
      await updatePictureUserId(id, userId);
    } else if (pictureInfo?.userId !== userId) {
      return new Response(JSON.stringify({ 
        "error": true, 
        "message": "Access denied. You don't have permission to get this picture." 
      }), { status: 403 });
    }
  } else if (userId === null && pictureInfo?.userId !== 'anonymous') {
    return new Response(JSON.stringify({ 
      "error": true, 
      "message": "Access denied. You don't have permission to get this picture." 
    }), { status: 403 });
  }

  return new Response(JSON.stringify(pictureInfo), { status: 200 });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } },) {
  const { userId } = auth();
  const id = params.id || "";
  const body = await req.json();

  const pictureInfo = await findPictureById(id);

  if (pictureInfo?.userId !== 'anonymous' && userId != pictureInfo?.userId) {
    return new Response(JSON.stringify({ 
      "error": true, 
      "message": "Access denied. You don't have permission to modify this picture." 
    }), { status: 403 });
  }

  if (pictureInfo?.userId == 'anonymous' && userId !== null) {
    await updatePictureUserId(id, userId);
  }

  const ret = await updatePictureDescription(id, body.description); // Insert record into database
  console.log(ret);
  if (Number(ret[0].numUpdatedRows) === 0) {
    return new Response(JSON.stringify({ message: 'Update failed' }), { status: 500 });
  } else {
    const picture = await findPictureById(id);
    return new Response(JSON.stringify({ "success": true }), { status: 200 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } },) {
  const { userId } = auth();
  const id = params.id || "";

  if (!userId) {
    return new Response(JSON.stringify({ 
      "error": true, 
      "message": "Access denied. Please log in first." 
    }), { status: 401 });
  }

  const pictureInfo = await findPictureById(id);

  if (!pictureInfo) {
    return new Response(JSON.stringify({ 
      "error": true, 
      "message": "Picture does not exist." 
    }), { status: 404 });
  }

  if (pictureInfo.userId !== userId) {
    return new Response(JSON.stringify({ 
      "error": true, 
      "message": "Access denied. You don't have permission to delete this picture." 
    }), { status: 403 });
  }

  const ret = await deletePictureByUserIdAndPictureId(id, userId);
  
  if (Number(ret[0].numUpdatedRows) === 0) {
    return new Response(JSON.stringify({ message: 'Delete failed' }), { status: 500 });
  } else {
    return new Response(JSON.stringify({ "success": true }), { status: 200 });
  }
}
