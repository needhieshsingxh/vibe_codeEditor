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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RenameFileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRename: (newFilename: string, newExtension: string) => void;
  currentFilename: string;
  currentExtension: string;
}

const RenameFileDialog: React.FC<RenameFileDialogProps> = ({
  isOpen,
  onClose,
  onRename,
  currentFilename,
  currentExtension,
}) => {
  const [filename, setFilename] = useState(currentFilename);
  const [extension, setExtension] = useState(currentExtension);

  React.useEffect(() => {
    setFilename(currentFilename);
    setExtension(currentExtension);
  }, [currentFilename, currentExtension, isOpen]);

  const handleSubmit = () => {
    if (!filename.trim()) return;
    onRename(filename.trim(), extension);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename File</DialogTitle>
          <DialogDescription>
            Update the filename and/or extension
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Filename</label>
            <Input
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              autoFocus
            />
          </div>
          <div>
            <label className="text-sm font-medium">Extension</label>
            <Select value={extension} onValueChange={setExtension}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="js">JavaScript (.js)</SelectItem>
                <SelectItem value="jsx">JSX (.jsx)</SelectItem>
                <SelectItem value="ts">TypeScript (.ts)</SelectItem>
                <SelectItem value="tsx">TSX (.tsx)</SelectItem>
                <SelectItem value="json">JSON (.json)</SelectItem>
                <SelectItem value="css">CSS (.css)</SelectItem>
                <SelectItem value="html">HTML (.html)</SelectItem>
                <SelectItem value="md">Markdown (.md)</SelectItem>
                <SelectItem value="txt">Text (.txt)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!filename.trim()}>
            Rename
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RenameFileDialog;
