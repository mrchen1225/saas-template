'use client';

import {
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  Table
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Product } from './product';
import { Picture } from '@/prisma/types';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ProductsTable({
  products,
  offset,
  totalProducts,
  userId,
  locale
}: {
  products: Picture[];
  offset: number;
  totalProducts: number;
  userId: string;
  locale: any;
}) {
  let router = useRouter();
  let productsPerPage = 10;

  function prevPage() {
    router.back();
  }

  function nextPage() {
    router.push(`/workbench?offset=${offset + productsPerPage}`, { scroll: false });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{locale.title}</CardTitle>
        <CardDescription>
          {locale.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                <span className="sr-only">{locale.image}</span>
              </TableHead>
              <TableHead className="hidden md:table-cell">{locale.createdAt}</TableHead>
              <TableHead className="hidden md:table-cell">{locale.id}</TableHead>
              <TableHead>{locale.status}</TableHead>
              <TableHead>{locale.actions}</TableHead>
              <TableHead>
                <span className="sr-only">{locale.actions}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <Product product={product} userId={userId} key={product.id as unknown as string} locale={locale.product}/>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <form className="flex items-center w-full justify-between">
          <div className="text-xs text-muted-foreground">
            {locale.showing}{' '}
            <strong>
              {Number(offset) + 1} - {Math.min(Number(offset) + productsPerPage, Number(totalProducts))}
            </strong>{' '}
            {locale.of} <strong>{Number(totalProducts)}</strong> {locale.products}
          </div>
          <div className="flex">
            <Button
              formAction={prevPage}
              variant="ghost"
              size="sm"
              type="submit"
              disabled={offset === 0}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              {locale.prev}
            </Button>
            <Button
              formAction={nextPage}
              variant="ghost"
              size="sm"
              type="submit"
              disabled={offset + productsPerPage > totalProducts}
            >
              {locale.next}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardFooter>
    </Card>
  );
}
