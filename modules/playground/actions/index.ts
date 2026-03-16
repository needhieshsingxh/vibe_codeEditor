"use server";

import {currentUser} from "@/modules/auth/actions"
import {db} from "@lib/db";
import {TemplateFolder} from "../lib/path-to-json";
import {revalidatePath} from "next/cache";

export const getPlaygroundById = async (id:string)=>{
    try{
        const playground = await db.playground.findUnique({
            where:{id},
            select: {}
        })

    }catch(error){

    }
}