import { Button } from "@/components/ui/button";
import { RocketIcon } from "lucide-react";
import Link from "next/link";

const CTAButton = ({ locale }: { locale: any }) => {
  return (
    <Link href="#Generator" rel="noopener noreferrer nofollow">
      <Button
        variant="default"
        className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white"
        aria-label="Generate your tags"
      >
        <RocketIcon />
        {locale.title}
      </Button>
    </Link>
  );
};

export default CTAButton;

