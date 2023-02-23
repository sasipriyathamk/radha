import React,{useEffect, useReducer, useState} from 'react'
import defaultuser from '../static/img/defaultuser.jpg';
import Axios from "axios";
import swal from "sweetalert";
import { FiEdit2 } from "react-icons/fi";
import { GetUserProfileReducer, profileInitialState } from '../store/reducers/userReducer';
import { GET_USER_PROFILE_FAIL, GET_USER_PROFILE_REQUEST, GET_USER_PROFILE_SUCCESS } from '../store/constants/user_action_types';
import '../styles/Profile.css';
import { Container } from 'react-bootstrap';
import { checkTokenExpired } from '../utils/checkTokenExpired';

export const Profile=()=>{
    const[name,setName]=useState('');
    const[designation,setDesignation]=useState('')
    const[department,setDepartment]=useState('')
    const[phone,setPhone]=useState('')
    const[reportingToEmail,setReportingToEmail]=useState();
    const[reportingToName,setReportingToName]=useState();
    const[homeAddress,setHomeAddress]=useState('')
    const[edit,setEdit]=useState(false) 
    const [img,setImg] = useState();
    const [displayImg,setDisplayImg] = useState();
    const [imgName,setImgName] = useState('img');
    const [stateGetProfile,dispatchGetProfile] = useReducer(GetUserProfileReducer,profileInitialState);
    const[done,setDone]=useState(true);

    const handleEdit=(e)=>{
        setEdit(true);
    }
    const userInfo = JSON.parse(localStorage.getItem("dfUserInfo"))
    var empid = userInfo &&  userInfo.empid; 
    var token = userInfo &&  userInfo.token;
    var email = userInfo &&  userInfo.email;
    
    useEffect(()=>{
        dispatchGetProfile({type:GET_USER_PROFILE_REQUEST});
            Axios.get("/api/users/getprofile",
            {
                params:{email},
                headers: {"Authorization" : `${token}`}
            }
            )
            .then((response)=>{
                setName(response.data.fullName)
                setDepartment(response.data.department)
                setDesignation(response.data.designation)
                setPhone(response.data.phoneNumber)
                setHomeAddress(response.data.homeAddress)
                setReportingToEmail(response.data.reportingToEmail);
                setReportingToName(response.data.reportingToName);
                dispatchGetProfile({type:GET_USER_PROFILE_SUCCESS,payload:response.data});

            })
            .catch((error)=>{
                dispatchGetProfile({type:GET_USER_PROFILE_FAIL,payload:error});
                swal("Error in getting profile");
            })

            //hide the reporting person in profile page for required roles and hide for others
            if(userInfo.type==="vo" || userInfo.type==='cco' || userInfo.type==='ao' || userInfo.type==='admin'){
                setDone(false);
            }
    },[email,token,userInfo.type])//here email,token,userInfo.type added as dependencies

    const changeHandler= async (event)=>{
        if(event.target.files[0].type.includes("image")){
                setImg(event.target.files[0]);
                setImgName(event.target.files[0].name);
                setDisplayImg(URL.createObjectURL(event.target.files[0]));
            }
            else{
                swal("you've entered a non-image file. please enter IMAGE ONLY")
            }
    }
    const handleSubmit = async (e) => {

        e.preventDefault();
            const imgData = new FormData()
            imgData.append('email',email);
            imgData.append('img',img);
            imgData.append('fileName',imgName);
            imgData.append('phoneNumber',phone);
            imgData.append('homeAddress',homeAddress);
            imgData.append('reportingToEmail',reportingToEmail);
            imgData.append('reportingToName',reportingToName)
            await Axios.post("/api/users/updateprofile",
                imgData,{
                headers: {
                    'Content-Type':`multipart/form-data; boundary=${imgData._boundary}`,
                    "Authorization" : `${token}`
                },                
            }).then((response)=>{
                window.location.replace("/profile");
            })
            .catch((error)=>{
                swal("Please enter valid details");
            })
    }  
    useEffect(() => {

        Axios.get('/api/users/getuserprofileimage',
        {
          params:{email},
          headers: {"Authorization" : `${token}`}
        }
        )
        .then((res) => {
          setDisplayImg(res.data);  
        })
        .catch((error)=> {
          if(!checkTokenExpired(error.response.status))
          swal("Unable to Preview file")
        })
    },[email,token])//here token added as dependency
    return(
    
        <center><div className="col-sm-12 col-md-12 col-lg-12" style={{padding:"5px"}}>
        <div style={{backgroundColor:"white",borderRadius:"1rem",padding:"3pxrem 3rem ",width:"auto",minWidth:"100%",overflowX:"auto"}}>
        <div className='profile-cover'>
        </div>
        <form onSubmit={handleSubmit} method="POST" encType="multipart/form-data">
        <div className="upper">
            <div>
                {(!displayImg || stateGetProfile.loading) && <img src={defaultuser}  className="profile-img" alt="" width="100px" height="100px" /> }
                {(displayImg && !stateGetProfile.loading) && <img src={displayImg}  className="profile-img" alt="" width="100px" height="100px" /> }
            </div>  
        </div>  
        {edit &&<center>
            <div class="fileInput">
            <input
       type="file"
       id="file-input"
       class="file-input__input"
    src={img}  accept='image/*' onChange={changeHandler}  name="img"
  />
  <label class="file-input__label" for="file-input">
 
    <FiEdit2/></label>
                </div>
             </center>} 
            <div className="lower">
               <div> 
                   <center>
                        <h1 style={{textTransform:"capitalize"}}>{name}</h1>
                    </center> 
               </div>
               <Container fluid>
               <div className="main row">
               <div className="col-sm-0 col-md-0 col-lg-1" ></div>
                   <div className="col-sm-12 col-md-12 col-lg-4 official">
                       <br/>
                       <br/>
                       <h5>Employee Id:  </h5>  
                       <input type="text" value={empid} readOnly className="form-control border-0"/>
                       <br/>
                       <h5>Designation:  </h5> 
                       <input type="text" value={designation} readOnly className="form-control border-0"/>
                       <br/>
                       <h5>Department:  </h5> 
                       <input type="text" value={department} readOnly className="form-control border-0"/>
                        <br></br>
                        <br></br>
                   </div>
                   <div className="col-sm-0 col-md-0 col-lg-2" ></div>
                   <div className="col-sm-12 col-md-12 col-lg-4 personal" >
                   <br/>
                   <br/>
                       <h5>Email-Id:  </h5>  
                       <input type="text" value={email} readOnly className="form-control"/>
                       <br/>
                       <h5>Phone No:  </h5> 
                       <input type="number" value={phone && phone} onChange={(e)=>{edit && setPhone(e.target.value)}} className={ edit ? "form-control":"form-control" }/>
                       <br/>

                       {/* used ternory operator for remove the reporting in profile page */}
                       {done && <>
                        <h5>Reporting To</h5>
                        <input type="text" value={reportingToName && reportingToName} readOnly className='form-control'/>
                        </>
                        }
                      
                   </div>
                   <div className="col-sm-0 col-md-0 col-lg-1" ></div>
                </div>
                </Container>
                <br/>
             
            </div>
            <div>
                   <center>
                        {!edit ? <button type="button" onClick={handleEdit} className="page-button">Edit</button>:
                        <div style={{display:"flex",flexWrap:"nowrap",justifyContent:"space-between",width:"20rem"}}>
                            <button type="submit" className="page-button">Save</button>
                            <button type="button" className="page-cancel-button" onClick={()=>setEdit(false)}>Cancel</button>
                        </div>
                        }
                    </center> 
                </div>
            </form>
            </div>
       </div>
       </center>
    
    )
}