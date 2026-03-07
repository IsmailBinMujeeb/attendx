import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

export function DrawerComponent({
  title,
  description,
  buttonText,
  children,
  onOpen,
  onClose,
  buttonVariant,
  buttonClass,
  buttonIcon,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  buttonText?: string;
  onOpen?: () => void;
  onClose?: () => void;
  buttonVariant?:
    | "link"
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | null;
  buttonClass?: string;
  buttonIcon?: React.ReactNode;
}) {
  return (
    <Drawer
      onOpenChange={(open) => {
        if (open) onOpen?.();
        else onClose?.();
      }}
    >
      <DrawerTrigger asChild>
        <Button variant={buttonVariant} className={buttonClass}>
          {buttonIcon && <span className="mr-2">{buttonIcon}</span>}
          {buttonText && <div>{buttonText}</div>}
        </Button>
      </DrawerTrigger>

      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>

          <div className="p-4 pb-0">
            <div className="flex items-center justify-center">{children}</div>
          </div>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Done</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
