import { useState, useEffect, useCallback } from "react";
import { WebContainer } from "@webcontainer/api";
import { TemplateFolder } from "@/modules/playground/lib/path-to-json";

interface UseWebContainerProps {
  templateData: TemplateFolder;
}

interface UseWebContaierReturn {
  serverUrl: string | null;
  isLoading: boolean;
  error: string | null;
  instance: WebContainer | null;
  writeFileSync: (path: string, content: string) => Promise<void>;
  destory: () => void;
}

// Singleton to manage WebContainer instances globally
let bootPromise: Promise<WebContainer> | null = null;
let webcontainerInstance: WebContainer | null = null;
let bootErrorMessage: string | null = null;

const getWebContainerInstance = async (): Promise<WebContainer> => {
  // If already booted, return existing instance
  if (webcontainerInstance) {
    return webcontainerInstance;
  }

  // If boot is in progress, wait for it
  if (bootPromise) {
    return bootPromise;
  }

  // Start boot process
  bootPromise = WebContainer.boot()
    .then((instance) => {
      webcontainerInstance = instance;
      bootErrorMessage = null;
      return instance;
    })
    .catch((error) => {
      bootErrorMessage =
        error instanceof Error ? error.message : "Failed to boot WebContainer";
      bootPromise = null; // Reset to allow retry
      throw error;
    });

  return bootPromise;
};

export const useWebContainer = ({
  templateData,
}: UseWebContainerProps): UseWebContaierReturn => {
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [instance, setInstance] = useState<WebContainer | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initializeWebContainer() {
      try {
        const containerInstance = await getWebContainerInstance();

        if (!mounted) return;

        setInstance(containerInstance);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to initialize WebContainer:", error);
        if (mounted) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to initialize WebContainer",
          );
          setIsLoading(false);
        }
      }
    }

    initializeWebContainer();

    return () => {
      mounted = false;
      // Don't teardown on unmount - instance is global
    };
  }, []);

  const writeFileSync = useCallback(
    async (path: string, content: string): Promise<void> => {
      if (!instance) {
        throw new Error("WebContainer instance is not available");
      }

      try {
        const pathParts = path.split("/");
        const folderPath = pathParts.slice(0, -1).join("/");

        if (folderPath) {
          await instance.fs.mkdir(folderPath, { recursive: true });
        }

        await instance.fs.writeFile(path, content);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to write file";
        console.error(`Failed to write file at ${path}:`, err);
        throw new Error(`Failed to write file at ${path}: ${errorMessage}`);
      }
    },
    [instance],
  );

  const destory = useCallback(() => {
    // Clear local state but don't teardown the global instance
    setInstance(null);
    setServerUrl(null);
    setIsLoading(true);
  }, []);

  return { serverUrl, isLoading, error, instance, writeFileSync, destory };
};
