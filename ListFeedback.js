
import axios from 'axios';
import React, { useEffect, useReducer, useState } from 'react';
import swal from 'sweetalert';
import * as Reducer from '../store/reducers/userReducer.js';
import { checkTokenExpired } from '../utils/checkTokenExpired.js';
import '../styles/ListFeedback.css';
import { RiDeleteBin6Line } from 'react-icons/ri';

export const ListFeedback = () => {    
    const [feedbackList,setFeedbackList] = useState([]);
    const [issue,setIssue] = useState({});
    const [stateLogin,] = useReducer(Reducer.LoginReducer,Reducer.initialState);
    const userInfo = stateLogin.userInfo ? stateLogin.userInfo : null;
    const token = userInfo ? userInfo.token : "";
    const type = userInfo ? userInfo.type : "";

    useEffect(()=>{
        if(token)
        {
            axios.get("/api/users/getfeedback",       
            {headers: {"Authorization" : `${token}`}}
            )
            .then((response)=>{
                setFeedbackList(response.data);
               
            })
            .catch((error)=>{
              
                if(!checkTokenExpired(error.response.status))
                swal("Error in getting feedback list");
            })
        }
    },[userInfo,issue,token])//added token dependncy

    const handleDeleteIssue = (id) => {
        axios.delete("/api/users/deletecontactusissue",
            {params:{id},headers: {'Authorization' : `${token}`}}
            ).then((response)=>{
                setIssue(response.data);
                swal("Deleted successfully");
        })
        .catch((error)=>{
            swal("Error in deleting..");
        })

    }
    return (
        <>
        {type === "admin" && 
        <div style={{padding:"3rem"}}>
            <h3>Feedback</h3>
            <div>
            <table className='feedback-table'>
                {/* added new column and row for employee id */}
                <tr>
                    <th>SNo</th>
                    <th>Empid</th>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Actions</th>
                </tr>
            {feedbackList && feedbackList.map((e)=>(
               <tr >
                   <td>{e.id}</td>
                   <td> {e.empid}</td>
                   <td>{e.title}</td>
                   <td>{e.description}</td>
                   <td>
                       <button className='delete-button action-icons' onClick={()=>handleDeleteIssue(e.id)}><RiDeleteBin6Line/></button>
                   </td>
               </tr>
            )
            )}
            </table>
            </div>
        </div>
        }  
        </>
  )
}
