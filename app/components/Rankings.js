import { useEffect } from "react"

export default function page(){
useEffect(()=>{
 const fetchstudents = async ()=>{

    try{
        const data = await fetch('/api/auth/questions')
        
    }catch(error){}
 }

},[])



    return(<>
    
    </>)
}