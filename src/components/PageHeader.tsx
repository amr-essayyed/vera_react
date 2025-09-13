import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
//   actionButton?: {
//     label: string;
//     onClick?: () => void;
//     dialogContent?: ReactNode;
//   };
}

export default function PageHeader({
  title,
  description,
//   actionButton,
}: PageHeaderProps) {
//   const buttonElement = (
//     <Button className="rounded-full bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-2 transition-colors">
//       {actionButton?.label}
//     </Button>
//   );

  return (
    <div className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {title}
            </h1>
            {description && (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {description}
              </p>
            )}
          </div>
          {/* {actionButton && (
            <>
              {actionButton.dialogContent ? (
                <div></div>
              ) : (
                <Button
                  onClick={actionButton.onClick}
                  className="rounded-full bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-2 transition-colors"
                >
                  {actionButton.label}
                </Button>
              )}
            </>
          )} */}
        </div>
      </div>
    </div>
  );
}
