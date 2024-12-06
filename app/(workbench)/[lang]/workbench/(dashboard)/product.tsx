import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, UserRoundIcon } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Picture } from '@/prisma/types';

import ProductImage from './productImage';
import { toast } from 'react-toastify';

export function Product({ product, userId, locale }: { product: Picture, userId: string, locale: any }) {
  
  return (
    <TableRow>
      <TableCell className="hidden sm:table-cell">
        <ProductImage url={product.url} />
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {typeof product.createdAt === 'string'
          ? new Date(product.createdAt).toLocaleDateString(locale.dateLocale)
          : product.createdAt instanceof Date
            ? product.createdAt.toLocaleDateString(locale.dateLocale)
            : locale.invalidDate}
      </TableCell>
      <TableCell className="hidden md:table-cell">{product.id as unknown as string}</TableCell>
      <TableCell>
        <Badge variant="outline" className="capitalize">
          {locale.status[product.status] || product.status}
        </Badge>
      </TableCell>
      <TableCell>
        <Button
            variant="default"
            size="sm"
            className="capitalize"
            onClick={() => window.location.href = product.status === 'PROCESSED' ? `/overlay/${product.id}` : `/texture/${product.id}`}
            title={product.status.includes("PROCESSING") || product.status.includes("PAID") ? locale.processingTooltip : ""}
          >
            {product.status === 'PROCESSED' ? locale.download : locale.protectNow}
          </Button>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-haspopup="true" size="icon" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">{locale.toggleMenu}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{locale.actions}</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => {
              fetch(`/api/picture/${product.id}`, {
                method: 'DELETE',
              })
              .then(response => {
                if (response.ok) {
                  console.log(locale.deleteSuccess);
                  toast.success(locale.deleteSuccess);
                  window.location.reload();
                } else {
                  console.error(locale.deleteFailed);
                  toast.error(locale.deleteFailed);
                }
              })
              .catch(error => {
                console.error(locale.error, error);
                toast.error(locale.error, error);
              });
            }}>
              {locale.delete}
            </DropdownMenuItem>
            <DropdownMenuItem>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
