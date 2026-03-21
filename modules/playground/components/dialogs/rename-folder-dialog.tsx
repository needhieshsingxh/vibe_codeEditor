import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RenameFolderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRename: (newFolderName: string) => void;
  currentFolderName: string;
}

const RenameFolderDialog: React.FC<RenameFolderDialogProps> = ({
  isOpen,
  onClose,
  onRename,
  currentFolderName,
}: RenameFolderDialogProps) => {
  const [folderName, setFolderName] = useState(currentFolderName);

  React.useEffect(() => {
    if (isOpen) {
      setFolderName(currentFolderName);
    }
  }, [currentFolderName, isOpen]);

  const handleSubmit = () => {
    if (!folderName.trim()) return;
    onRename(folderName.trim());
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Folder</DialogTitle>
          <DialogDescription>
            Enter the new name for the folder
          </DialogDescription>
        </DialogHeader>
        <div>
          <label className="text-sm font-medium">Folder Name</label>
          <Input
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!folderName.trim()}>
            Rename
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RenameFolderDialog;
