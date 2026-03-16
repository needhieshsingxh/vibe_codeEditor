import {useState, useEffect, useCallback} from 'react';
import {toast} from "sonner";
import{TemplateFolder} from "../lib/path-to-json"

interface PlaygroundData{
id: string;
name?:string;
[key: string]:any;
}

interface UsePlaygroundReturn{
    playgroundData:PlaygroundData | null;
    templateDate:TemplateFolder | null;
    isLoading:boolean;
    error:string | null;
    loadPlayground:()=>Promise<void>;
    saveTemplateData:(data:TemplateFolder) => Promise<void>

}

export const usePlayground = (id:string):UsePlaygroundReturn=>{
    const [playgroundData, setPlaygroundData] = useState<PlaygroundData | null>();
    const [templateData, setTemplateData] = useState<TemplateFolder | null>();
    const [error, setError] = useState<string | null> ();
    const loadPlayground = useCallback(async()=>{
        if(!id)return;

        try{
            setIsLoading(true);
            setError(null);
            const data = await getPlaygorundByID(id)
        }
        catch(error){
        
        }finally{

        }
    }, [id]);
}