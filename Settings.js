import React, { useEffect, useReducer, useState } from "react";
import { Dropdown , DropdownButton } from "react-bootstrap";
import { CgProfile } from "react-icons/cg";
import { BiLogIn } from "react-icons/bi";
import { initialState, LoginReducer } from '../store/reducers/userReducer';
import defaultuser from '../static/img/defaultuser.jpg';
import axios from "axios";
import swal from "sweetalert";
import { checkTokenExpired } from "../utils/checkTokenExpired";
import { FiSettings } from "react-icons/fi";
import { RiFeedbackLine } from "react-icons/ri";
import  "../styles/Settings.css";

export const Setting = () => {
    const [stateLogin,dispatchLogin] = useReducer(LoginReducer,initialState);
    const {userInfo} = stateLogin;
    let email = userInfo.email;
    let token = userInfo.token;
    let roles = userInfo.roles ? (userInfo.roles).split(" ") : [];
    let type = userInfo.type;
    const[fullName,setFullName] = useState("user-name");
    const[displayImg,setDisplayImg] = useState();

    const handleSignout = () => {
        localStorage.removeItem('dfUserInfo');
        dispatchLogin({type:'USER_SIGNOUT'});
        window.location.replace('/login');
    }

    const updateTypeInLocalStorage = (type) => {
    userInfo.type = type;
    localStorage.setItem('dfUserInfo',JSON.stringify(userInfo));

   //redirect to the default to dashboard when the user change their role 
   if(userInfo && (userInfo.type==="vo"||userInfo.type==='ao'||userInfo.type==='cco'||userInfo.type==='employee'||userInfo.type==='manager'||            userInfo.type==='admin'||userInfo.type==='management')){
        window.location.replace('/');
    }
    else{
    window.location.reload();
    }
    }

    useEffect(() => {
        axios.get('/api/users/getuserprofileimage',
        {
            params:{email},
            headers: {"Authorization" : `${token}`}
        }
        )
        .then((res) => {
            setDisplayImg(res.data);  
        })
        .catch((error) => {
        if(!checkTokenExpired(error.response.status))
        swal("Unable to Preview file")
        })
    })
    useEffect( () => {
        if(email) {
        axios.get("/api/users/getprofile", 
        {
            params:{email},
            headers: {"Authorization" : `${token}`}
        }
        )
        .then((response) => {
        setFullName(response.data.fullName);
        })
        .catch((error) => {
        swal("Error in getting profile");
        })
        }
    },[email,token]) //token added as dependency

    return(
    <div style={{position:'relative',zIndex:'10'}}>
    <DropdownButton   variant = '' style={{height:'2rem'}}  className="inside" title = {fullName}>
    {/* Items inside Dropdown button */}
    <Dropdown.Item  style={{width:'15rem',verticalAlign:'0',textDecoration:'none',cursor:'pointer',backgroundColor:'#f6f6f6'}}>
    <div>
        {displayImg ? <img src={displayImg} alt='User-profileImage' className="largeimage"/>:
        <img src={defaultuser} alt='Default-user-profile' className="largeimage"></img>}
        <center className="nameofuser" >{fullName}</center>
    </div>
    </Dropdown.Item>
    <div >
    <div style={{whiteSpace:"nowrap",alignItems:"center"}}>
    <center><p>Role</p>
        <select
            className="select-role"
            defaultValue="select"
            value={type}
            onChange={(e) => updateTypeInLocalStorage(e.target.value)}
            name="role"
            >
            {roles.map((e, i) => (
            <option value={e} key={i}>
                {e.toUpperCase()}
            </option>
            ))}
        </select>
    </center></div>
</div>
    <Dropdown.Item href="/profile" style={{textDecoration:'none'}} ><><CgProfile  className="dropitems" />Profile</></Dropdown.Item>
    {type === "admin" && <Dropdown.Item href="/adminsettings"style={{textDecoration:"none"}}><><FiSettings  className="dropitems" />Settings</></Dropdown.Item>}
    {type === "admin" && <Dropdown.Item href="/feedback"style={{textDecoration:"none"}}><><RiFeedbackLine  className="dropitems" />Feedback</></Dropdown.Item>}
    <Dropdown.Item onClick={handleSignout}  style={{textDecoration:'none'}}><><BiLogIn   className="dropitems" />Log Out</></Dropdown.Item>
    </DropdownButton>
    </div>
    );
    }
