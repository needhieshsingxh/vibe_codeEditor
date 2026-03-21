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

interface NewFileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFile: (filename: string, extension: string) => void;
}

const NewFileDialog: React.FC<NewFileDialogProps> = ({
  isOpen,
  onClose,
  onCreateFile,
}) => {
  const [filename, setFilename] = useState("");
  const [extension, setExtension] = useState("js");

  const handleSubmit = () => {
    if (!filename.trim()) return;
    onCreateFile(filename.trim(), extension);
    setFilename("");
    setExtension("js");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New File</DialogTitle>
          <DialogDescription>
            Enter the filename and select an extension
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Filename</label>
            <Input
              placeholder="e.g., index"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
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
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewFileDialog;
