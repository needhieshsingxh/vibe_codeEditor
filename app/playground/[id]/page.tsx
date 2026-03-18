"use client"
import React from 'react'
import {useParams} from "next/navigation";
import { SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import {Separator} from "@/components/ui/separator"
import TemplateFileTree from '@/modules/playground/componets/template-file-tree';
import{usePlayground} from "@/modules/playground/hooks/usePlayground"


const page = () => {
    const{id} = useParams<({id:string})>();
    const {playgroundData, templateData, isLoading, error, saveTemplateData} = usePlayground(id);
      const {
    activeFileId,
    closeAllFiles,
    openFile,
    closeFile,
    editorContent,
    updateFileContent,
    handleAddFile,
    handleAddFolder,
    handleDeleteFile,
    handleDeleteFolder,
    handleRenameFile,
    handleRenameFolder,
    openFiles,
    setTemplateData,
    setActiveFileId,
    setPlaygroundId,
    setOpenFiles,
  } = useFileExplorer();

  
  return (
  <div>
    <>
    < TemplateFileTree data={templateData} />
        <SidebarInset>
            <header className="flex h-16 shrink=0 items-center gap-2 border-b px-4">
                <SidebarTrigger className="-ml-1"/>
                <Separator orientation="vertical" className="mr-2 h-4"/>
                <div className="flex flex-1 items-center gap-2">
                    <div className='flex flex-col flex-1'>


                    </div>

                </div> 

            </header>
        </SidebarInset>
    </>
  </div>

  )
}

export default page