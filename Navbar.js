import React, { useEffect, useReducer, useState } from "react";
import '../styles/Navbar.css';
import { FaBars } from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";
import { NavLink, useLocation } from "react-router-dom";
import pic from '../static/img/logo.svg';
import { Setting } from "./Settings";
import { initialState, LoginReducer } from '../store/reducers/userReducer';
import { AddEmployee } from "./AddEmployee";
import defaultuser from '../static/img/defaultuser.jpg';
import axios from "axios";
import swal from "sweetalert";
import { checkTokenExpired } from "../utils/checkTokenExpired";

export const Navbar = () => {
    const [showMediaIcons, setShowMediaIcons] = useState(false);
    const[navbar] =useState(false);
    const [stateLogin] = useReducer(LoginReducer,initialState);
    const {userInfo} = stateLogin; 
    let email = userInfo.email;
    let token = userInfo.token;
    const[displayImg,setDisplayImg] = useState();

    useEffect(() => {
        axios.get('/api/users/getuserprofileimage',
        {
          params:{email},
          headers: {"Authorization" : ` ${token}`}
        }
        )
        .then((res) => {
          setDisplayImg(res.data);  
        })
        .catch((error)=> {
          if(!checkTokenExpired(error.response.status))
          swal("Unable to Preview file")
        })
    })

    //it is for highlight the active nav items
    const [activeTab, setActiveTab] = useState("");
    const location = useLocation()

    useEffect(()=>{
      const {pathname} = location
      if(pathname ==="/"){
        setActiveTab("dashboard")
      }else if(pathname === "/uploadedbills" || pathname==='/pendingbills' || pathname==='/approvedbills'){
        setActiveTab("reports")
      }else if(pathname === '/employees') {
        setActiveTab('employees')
      }else if (pathname === '/uploadbill'){
        setActiveTab('uploadReport')
      }
    },[location])


  return (
    <>
      <nav style={{borderBottom:"2px solid #f6f6f6"}} className={showMediaIcons ? navbar ? "main-nav nav-active":"main-nav nav-active" : navbar ? "main-nav nav-active" :"main-nav nav-active"} >
          <div className="logo">
            <img src={ pic } alt = 'Datafoundry' className="datafoundry" />
          </div>
          <div className = {showMediaIcons ? "menu-link mobile-menu-link" : "menu-link"}>
            <ul>
              <li onClick={() => setShowMediaIcons(false)}>
                <NavLink to="/" style={activeTab==="dashboard" ? {color:"cornflowerblue"}: null}>DASHBOARD</NavLink>
              </li>
              {userInfo && userInfo.type === "admin" ? 
                <li onClick={() => setShowMediaIcons(false)} >
                  <NavLink to="/employees" style={activeTab==="employees" ? {color:"cornflowerblue"}: null}>EMPLOYEES</NavLink>
                </li> :
                <li onClick={() => setShowMediaIcons(false)} >
                  <NavLink to="/uploadedbills" style={activeTab==="reports" ? {color:"cornflowerblue"}: null}>REPORTS</NavLink>
                </li>
              }
              {userInfo && userInfo.type === "admin" ? 
                <li onClick={() => setShowMediaIcons(false)} >
                  <button className="delete-button" style={{fontSize:"14px",backgroundColor:"inherit"}}  data-bs-toggle="modal" data-bs-target="#addEmployeeModal" >
                  <strong style={activeTab==="add employee" ? {color:"cornflowerblue"}: null}>ADD EMPLOYEE</strong>
                  </button>
                </li> :
                userInfo && userInfo.type !== "ao" && userInfo.type !== "vo" && userInfo.type !== "cco" && <li onClick={() => setShowMediaIcons(false)}>
                  <NavLink to="/uploadbill" style={activeTab==="uploadReport" ? {color:"cornflowerblue"}: null}>UPLOAD A REPORT</NavLink>
                </li> 
              }
            </ul>
          </div>
          
          <div className="settings" >
            <strong  className="user-name"> <Setting /> </strong>
            {/* Profile image of user */}
            <a href="/profile">
              {displayImg ? <img src={displayImg} alt="User_Image" className="image"/>:
              <img src={defaultuser} alt="Default_user_Image" className="image"></img>}
            </a>
          </div>
          <div className="hamburger-menu">
            <button style={{backgroundColor:'white'}}  onClick={() => setShowMediaIcons(!showMediaIcons)}>
              {showMediaIcons ? <AiOutlineClose color="black"/>:< FaBars color="black"/>}
            </button>
          </div>
      </nav>
      <div className="modal " id="addEmployeeModal" >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div style={{paddingTop:'1rem',paddingLeft:'3rem',paddingRight:'3rem',borderBottom:'1px solid black',marginBottom:'5px',paddingBottom:'10px'}}>
                <h3 className="report-type" style={{color:"#2A1CA7",fontSize:'20px'}}>Add employee</h3>
            </div>
            <div className="modal-body" style={{padding:'0rem 3rem 2rem'}}>
              <AddEmployee/>
            </div>
          </div>
        </div>
      </div>  
    </>
  );
};
