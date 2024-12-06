import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { File, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductsTable } from './products-table';
import { countPicturesByUserId, findPictures, listPicturesByUserIdPaginated, listPicturesPaginated } from '@/database/pictureRepo';
import ImageUploader from '@/components/home/Uploader';
import { getDictionary, defaultLocale } from '@/lib/i18n';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import Link from 'next/link';
import { Picture } from '@/prisma/types';
import { currentUser } from '@clerk/nextjs/server';

export default async function ProductsPage({
  searchParams,
  params
}: {
  searchParams: { q: string; offset: number };
  params: { lang: string };
}) {
  const search = searchParams.q ?? '';
  const offset = searchParams.offset ?? 0;

  const user = await currentUser();
  if (!user) {
    return <div>Login Please</div>;
  }
  const userId = user.id;
  const pictures = await listPicturesByUserIdPaginated(userId, offset, 10);
  const totalProducts = await countPicturesByUserId(userId);

  const langName = params.lang !== "" ? params.lang : defaultLocale;

  console.log("lang: ", params.lang);
  console.log("langName: ", langName);

  const dict = await getDictionary(langName);

  return (
    <>
      <DashboardBreadcrumb locale={dict.Breadcrumb} />
      <div className="flex justify-center">
        <ImageUploader id="Uploader" locale={dict.UploadNewPicture} langName={langName} />
      </div>
      <Tabs defaultValue="all">
        <div className="flex items-center">
          <div className="ml-auto flex items-center gap-2">
          </div>
        </div>
        <TabsContent value="all">
          <ProductsTable
            products={pictures as unknown as Picture[]}
            offset={offset}
            totalProducts={totalProducts.count as number}
            userId={userId}
            locale={dict.ProductsTable}
          />
        </TabsContent>
      </Tabs>
    </>
  );
}

function DashboardBreadcrumb({ locale }: { locale: any }) {
  return (
    <Breadcrumb className="hidden md:flex">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="#">{locale.title}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{locale.allPictures}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
