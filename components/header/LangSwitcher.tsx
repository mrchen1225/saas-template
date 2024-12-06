"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useParams, useRouter } from "next/navigation";

import { defaultLocale, localeNames } from "@/lib/i18n";

export const LangSwitcher = () => {
  const params = useParams();
  const lang = Array.isArray(params?.lang) ? params.lang[0] : params?.lang;
  const langName = lang !== "" ? lang : defaultLocale;
  const router = useRouter();
  const handleSwitchLanguage = (value: string) => {
    const currentPath = window.location.pathname;
    const pathSegments = currentPath.split('/').filter(segment => segment !== '');

    if (value === defaultLocale) {
      if (pathSegments.length > 0) {
        // 如果当前不在根路径，则移除语言前缀（如果存在）
        const newPath = '/' + pathSegments.slice(1).join('/');
        router.push(newPath);
      } else {
        router.push('/');
      }
    } else {
      if (pathSegments[0] === defaultLocale || Object.keys(localeNames).includes(pathSegments[0])) {
        // 如果当前路径已经包含语言前缀，则替换它
        const newPath = `/${value}/${pathSegments.slice(1).join('/')}`;
        router.push(newPath);
      } else {
        // 如果当前路径没有语言前缀，则添加新的语言前缀
        const newPath = `/${value}${currentPath}`;
        router.push(newPath);
      }
    }
  };

  return (
    <Select value={langName} onValueChange={handleSwitchLanguage}>
      <SelectTrigger className="w-fit">
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent>
        {Object.keys(localeNames).map((key: string) => {
          const name = localeNames[key];
          return (
            <SelectItem className="cursor-pointer" key={key} value={key}>
              {name}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};

