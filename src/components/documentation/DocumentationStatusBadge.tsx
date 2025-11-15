import { DocumentationStatus } from "@/types";
import { Badge } from "@/components/ui/badge";

interface DocumentationStatusBadgeProps {
  status: DocumentationStatus;
}

export const DocumentationStatusBadge = ({ status }: DocumentationStatusBadgeProps) => {
  const labelMap: Record<DocumentationStatus, string> = {
    OPEN: "Offen",
    IN_REVIEW: "In Überprüfung",
    VERIFIED: "Überprüft",
  };

  const variantMap: Record<DocumentationStatus, "secondary" | "default" | "outline"> = {
    OPEN: "secondary",
    IN_REVIEW: "default",
    VERIFIED: "outline",
  };

  const classesMap: Record<DocumentationStatus, string> = {
    OPEN: "bg-muted text-muted-foreground",
    IN_REVIEW: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    VERIFIED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  };

  return (
    <Badge variant={variantMap[status]} className={classesMap[status]}>
      {labelMap[status]}
    </Badge>
  );
};
