'use client';

import { useState, useEffect } from 'react';
import { bucketName, supabase } from '@/components/utils/supabaseClient';
import Image from 'next/image';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

interface PaidPicture {
  id: string;
  userId: string;
  tags: string[];
  url: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  params: Record<string, any>;
  description: string;
}

export default function AdminPage() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const [paidPictures, setPaidPictures] = useState<PaidPicture[]>([]);
  const [latestPaidImage, setLatestPaidImage] = useState<string | null>(null);
  const [latestPaidPicture, setLatestPaidPicture] = useState<PaidPicture | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [updateId, setUpdateId] = useState<string>('');
  const [updateStatus, setUpdateStatus] = useState<string>('');
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [uploadResult, setUploadResult] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthorization = async () => {
      if (isLoaded && (userId === 'user_2lTLLoLn4I4sxz0l1ruSlYr4pwS' || userId === 'user_2kbsJ0hADwZpu2DzNaRfeScHOrD')) {
        setIsAuthorized(true);
      } else {
        // 检查HTTP头中是否有认证信息
        const checkAuthHeader = async () => {
          try {
            const response = await fetch('/api/admin/checkauth', {
              method: 'GET'
            });
            if (response.ok) {
              setIsAuthorized(true);
            } else {
              router.push('/');
            }
          } catch (error) {
            console.error('认证检查失败:', error);
            router.push('/');
          }
        };
        checkAuthHeader();
      }
    };

    checkAuthorization();
  }, [isLoaded, router, userId]);

  useEffect(() => {
    if (isAuthorized) {
      fetchPaidPictures();
    }
  }, [isAuthorized]);

  if (!isLoaded || (!isAuthorized && !userId)) {
    return null;
  }

  const fetchPaidPictures = async () => {
    try {
      const response = await fetch('/api/admin/getpaidpictures');
      if (!response.ok) {
        throw new Error('获取已支付图片失败');
      }
      const data = await response.json();
      console.log(data);
      if (data && data.paidPictures) {
        setPaidPictures(data.paidPictures);
      }
      if (data && data.latestPaidPicturesignedUrl) {
        setLatestPaidImage(data.latestPaidPicturesignedUrl);
      }
      if (data && data.latestPaidPicture) {
        setLatestPaidPicture(data.latestPaidPicture);
      }
    } catch (error) {
      console.error('获取已支付图片失败:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
    }
  };

  const uploadToSupabase = async () => {
    if (!uploadFile) return;
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(`protected/${uploadFile.name}`, uploadFile);
      if (error) throw error;
      setUploadResult('上传成功');
    } catch (error) {
      console.error('上传失败:', error);
      setUploadResult('上传失败');
    }
  };

  const updateImageStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('pictures')
        .update({ status: updateStatus })
        .eq('id', updateId);
      if (error) throw error;
      alert('状态更新成功');
    } catch (error) {
      console.error('更新状态失败:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">管理界面</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">最新已支付图片</h2>
          {latestPaidImage && (
            <div className="flex justify-center">
              <Image src={latestPaidImage} alt="最新已支付图片" width={400} height={300} className="rounded-lg" />
            </div>
          )}
          {latestPaidPicture && (
            <div className="flex justify-center">
              <p>ID: {latestPaidPicture.id}</p>
              <p>用户ID: {latestPaidPicture.userId}</p>
              <p>URL: {latestPaidPicture.url}</p>
              <p>状态: {latestPaidPicture.status}</p>
              <p>创建时间: {new Date(latestPaidPicture.createdAt).toLocaleString()}</p>
              <p>描述: {latestPaidPicture.description}</p>
            </div>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">上传图片</h2>
          <input type="file" onChange={handleFileUpload} className="mb-4 w-full" />
          <button onClick={uploadToSupabase} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full transition duration-300 w-full mb-4">
            上传到Supabase
          </button>
          {uploadResult && (
            <div className={`text-center p-2 rounded ${uploadResult === '上传成功' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {uploadResult}
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-12">
        <h2 className="text-2xl font-semibold mb-4">已支付图片列表</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-3 text-left">ID</th>
                <th className="border p-3 text-left">用户ID</th>
                <th className="border p-3 text-left">URL</th>
                <th className="border p-3 text-left">状态</th>
                <th className="border p-3 text-left">创建时间</th>
                <th className="border p-3 text-left">描述</th>
              </tr>
            </thead>
            <tbody>
              {paidPictures.map((picture) => (
                <tr key={picture.id} className="hover:bg-gray-50">
                  <td className="border p-3">{picture.id}</td>
                  <td className="border p-3">{picture.userId}</td>
                  <td className="border p-3">{picture.url}</td>
                  <td className="border p-3">{picture.status}</td>
                  <td className="border p-3">{new Date(picture.createdAt).toLocaleString()}</td>
                  <td className="border p-3">{picture.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">更新图片状态</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="图片ID"
            value={updateId}
            onChange={(e) => setUpdateId(e.target.value)}
            className="flex-1 p-2 border rounded"
          />
          <input
            type="text"
            placeholder="新状态"
            value={updateStatus}
            onChange={(e) => setUpdateStatus(e.target.value)}
            className="flex-1 p-2 border rounded"
          />
          <button onClick={updateImageStatus} className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full transition duration-300">
            更新状态
          </button>
        </div>
      </div>
    </div>
  );
}
