import { Dropdown, ButtonToolbar } from 'rsuite';
import  'rsuite/dist/rsuite.min.css';
import React, { useCallback, useEffect, useReducer, useState } from 'react';
import Axios from 'axios';
import { Loading } from '../utils/Loading';
import swal from 'sweetalert';  
import { Container, FormControl, InputGroup, Modal } from 'react-bootstrap';
import {useDropzone} from 'react-dropzone';
import * as BillReducer from '../store/reducers/billReducer.js'; 
import { BILL_CREATE_FAIL, BILL_CREATE_REQUEST, BILL_CREATE_SUCCESS } from '../store/constants/bill_action_types';
import FormData from 'form-data';
import DatePicker from 'react-date-picker';
import { flow, mapTL, persons } from '../utils/Access.js';
import { FaList } from 'react-icons/fa';
import { AiOutlineCloudUpload } from "react-icons/ai";
import '../styles/BillForms.css';
import { currencies } from '../utils/currencies.js';
import axios from 'axios';
import { checkTokenExpired } from '../utils/checkTokenExpired.js';

export const UploadBillForm = (props) => {
    const [projectOthersShow,setProjectOthersShow] = useState(false);
    const [projects,setProjects] = useState([]);

    const [reportingToName,setReportingToName] = useState("");
    const [reportingToEmail,setReportingToEmail] = useState("");
    const [reportingOthersShow,setReportingOthersShow] = useState(false);

    const [fullName,setFullName] = useState("");
    const [category,setCategory] = useState("Select Category");
    const [projectName,setProjectName] = useState("");
    const [email,setEmail] = useState("");
    const [empid,setEmpid] = useState("");
    const [billno,setBillno] = useState("");
    const [billDate,setBillDate] = useState(new Date());
    const [amount,setAmount] = useState(0);
    const [desc,setDesc] = useState("");
    const [department,setDepartment] = useState("");
    const [img,setImg] = useState(null);
    const [imgName,setImgName] = useState("");
    const [billtype,] = useState("");
    const [toReceiveList,setToReceiveList] = useState([]);
	const [nextPerson, setNextPerson] = useState("");
    const [type, setType] = useState("");
    const [from,setFrom] = useState("INR");
    const [to,] = useState("INR");
    const [amountINR,setAmountINR] = useState(0);
    const [validation, setValidation] = useState(false);

	const changeHandler = async (acceptedFiles) => {
        if(acceptedFiles[0].name.match(/.(jpg|jpeg|png|pdf)$/i)) {
            const img =acceptedFiles[0]
            const fsize = img.size;
            const file = Math.round((fsize / (1024*1024)));
        if (file >= 15 ) {
                swal("File too Big, please select a file less than 15mb");
        }
        else {  
                setImg(img);
                setImgName(img.name);
        }
        }
	};
    const [stateCreateBill,dispatchCreateBill] = useReducer(BillReducer.CreateBillReducer,BillReducer.createBillIntialState);
   
    const onDrop = useCallback (
        (acceptedFiles) => {
            changeHandler(acceptedFiles)
        },[]
    )
    const {
        acceptedFiles,
        fileRejections, //added the file rejection variable
        getRootProps,
        getInputProps,
      } = useDropzone({ onDrop,multiple : false,accept: '.jpeg,.jpg,.png,.pdf'
      });

      //check the path of the file and check if it is in required extension or not
    const acceptedFileItems = acceptedFiles.map(file => (
        <li key={file.path}>
            {file.path} - {file.size} bytes
        </li>
    ));
    //if the uploaded bill is not in the required format throw the validation error
     const fileRejectionItems = fileRejections.map(({file, errors})=>(
        <li key={file.path}>
            {file.path} - {file.size} bytes
            <ul>
            {errors.map(e => (
          <li key={e.code}>{e.message}</li>
        ))}
            </ul>
        </li>
    ));
    
    const departments=["Accounts and Finance","Sales and marketing (Business development)","Infrastructures","Research and development",
                        "Learning and development","IT services","Product development","Admin department"];
    
    function getKeyByValue(object, value) {
        return Object.keys(object).find(key => object[key] === value);
    }
    //its prevent the minus symbol when the minus key pressed
    const preventMinus = (e) => {
        //console.log(e ,' minus symbol')
        if (e.code === 'Minus') {
            e.preventDefault();
        }
    };
    //its prevent the copy paste of minus symbol
    const preventPasteNegative = (e) => {
        //console.log(e ,' minus paste')
        const clipboardData = e.clipboardData || window.clipboardData;
        const pastedData = parseFloat(clipboardData.getData('text'));
        if (pastedData < 0) {
            e.preventDefault();
        }
    };
    
    const userInfo = JSON.parse(localStorage.getItem("dfUserInfo"));
    const [token, setToken]=useState('')
    useEffect(() => {
    if(userInfo){
        setToken(userInfo.token)
        setType(userInfo.type);
        setEmail(userInfo.email);
        setEmpid(userInfo.empid);
        if(flow[mapTL[type]]) 
            setNextPerson(getKeyByValue(mapTL,flow[mapTL[type]][0][0]));
    };
    },[userInfo,type])
    useEffect(() => {
        if(type){
            Axios.post("/api/bills/gettoreceivelist",
            {type},
            {headers: {"Authorization" : `${token}`}}
            )
            .then((response)=>{
                setToReceiveList(response.data);
            })
            .catch((error)=>{
                if(!checkTokenExpired(error.response.status))
                swal("Error occured in getting received list users");        
            })
        }
    },[type,token])

    useEffect(()=>{
        if(email) {
            Axios.get("/api/users/getuserbasicdetails", 
            {
                params:{email},
                headers: {"Authorization" : `${token}`}
            }
            )
            .then((response)=>{
                setFullName(response.data.fullName);
                setReportingToName(response.data.reportingToName);
                setReportingToEmail(response.data.reportingToEmail);
                
            })
            .catch((error)=>{
                swal("Error in getting basic details");
            })
            }
    },[email,token])
  const handleProjectName = (value) => {
      if(value === "Others")
      {
        setProjectOthersShow(true);
        setProjectName("");
      }
      else if(value === "Not Others")
      {
        setProjectOthersShow(false);
        setProjectName("");
      }
      else
      {
        setProjectOthersShow(false);
        setProjectName(value);
      }
  }
  const handleReportingTo = (value) => {
    let tvalue = JSON.parse(value);
    setReportingToEmail(tvalue.email);
    setReportingToName(tvalue.fullName);
  }
  const handleAmount = (amount) => {
    setAmount(amount);
  }
  const handleCurrency = (currency) => {
    setFrom(currency);
  }
  const handleDate = (date) => {
        let present = new Date();
        if(date.getTime() <= present.getTime()) {
            setBillDate(date);
        }
    }      
    useEffect(() => {
        convert();
    // Function to convert the currency
    function convert() {
        let day = billDate.getDate();
        let month = billDate.getMonth()+1;
        let year = billDate.getFullYear();    
        let t = year.toString()+'-'+month.toString()+"-"+day.toString();
        Axios.get(`https://api.exchangerate.host/convert?from=${from}&to=${to}&date=${t}&amount=${amount}`,
        )
        .then((res) => {
            setAmountINR(res.data.result);
            })
            .catch((err) => {
            })
    }
    convert();
},[from,billDate,amount,to])

    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidation(true);
        //write the conditions for all fields to check input fields are empty or not if its empty throw error else null
        if(category === "Select Category" || billno === "" || department ==='' || projectName ==='' || desc==='' || amount===0 || img===null)
        {
        return null;
        }
        else {
        const imgData = new FormData();
        imgData.append('file',img);
        imgData.append('fileName',imgName);
        imgData.append('fullName',fullName);
        imgData.append('empid',empid);
        imgData.append('email',email);
        imgData.append('type',type)
        imgData.append('description',desc);
        imgData.append('billno',billno);
        imgData.append('currency',from);
        imgData.append('amount',amount);
        imgData.append('amountINR',amountINR.toFixed(2))
        imgData.append('category',category);
        imgData.append('projectName',projectName);
        imgData.append('projectManager',reportingToEmail);
        imgData.append('userType',type);
        imgData.append('billType',billtype);
        imgData.append('department',department);
        imgData.append('billDate',billDate.getTime()+6*60*60*1000);
        dispatchCreateBill({type:BILL_CREATE_REQUEST});
        await Axios.post("/api/bills/upload",
            imgData,{
            headers: {
                'Content-Type':'multipart/form-data; boundary=${imgData._boundary}',
                'Authorization' : `${token}`
            }
        }).then((response)=>{
            dispatchCreateBill({type:BILL_CREATE_SUCCESS,payload:response.data});
            
            window.location.replace("/uploadedbills");
        })
        .catch((error)=>{
            dispatchCreateBill({type:BILL_CREATE_FAIL,payload:error});
            swal("Please enter valid bill details");
        }) 
        }
    }
    useEffect(()=>{
        if(token)
        {
            axios.get("/api/users/allprojects",       
            {headers: {"Authorization" : `${token}`}}
            )
            .then((response)=>{
                setProjects(response.data);
               
            })
            .catch((error)=>{
              
                if(!checkTokenExpired(error.response.status))
                swal("Error in getting projects list");
            })
        }
    },[token])

    return (
        // write the ternory to show UploadBillForm to manager and employee and hide for others
        userInfo && (userInfo.type==="vo" || userInfo.type==='cco'||userInfo.type==='ao')  ? <></>
           :
        <>
        <div>
            <h3 className='report'>New Expense Report</h3>
        </div>
        <Container fluid>
        <form onSubmit={handleSubmit} method="POST" encType="multipart/form-data" >
        <div className='main row' style={{paddingTop:'1rem'}}>
        <div className='col-sm-12 col-md-12 col-lg-4' style={{padding:'0rem 4rem 0rem 4rem'}}>
        <label>Name</label>
        <input type="text" value={fullName}  className="form-control" placeholder="Full name" disabled/>
        <br/>
        <label>Email</label>
        <input type="text" value={email} onChange={(e)=>setEmail(e.target.value)}  className="form-control" placeholder="Enter email" disabled />
        <br/>
        <label>Department</label>
        <select  className='form-select form-control' onChange={(e)=>setDepartment(e.target.value)} defaultValue={department} >
        <option value="" disabled>Select department name</option>
        {departments.map((e,i)=>(
        <option value={e} key={i}>{e}</option>))}
        <option value="Others">Others</option>
        </select>
        {/* check the validation and throw the error */}
        {validation && department ==='' ? <div style={{color:'red'}}>Please Select Department</div> : null}
        <br/>
        <label>{persons[nextPerson]}</label>
        <br/>
        <InputGroup className="mb-3">
            <FormControl
            placeholder="Select Person"
            aria-label="Select Person"
            aria-describedby="basic-addon2"
            value={reportingToName}
            />
        {/* <button type="button" className='btn text-white' style={{backgroundColor:"var(--primaryBlue)"}} onClick={()=>setReportingOthersShow(true)}>Change</button> */}
        </InputGroup>
        
        <div className='form-group-grid'>
            <div className='form-group'>
               <label>Category</label>
                <br></br>
                <div  style={{width:"100%",backgroundColor:'white',color:'#2A1CA7'}}>
                <ButtonToolbar style={{backgroundColor:'white',color:'#2A1CA7'}}>
                    <Dropdown title={category}  style={{width:"100%",backgroundColor:'white',color:'#2A1CA7'}} check >
                    <Dropdown.Menu  placement = 'rightstart' trigger="click" title="Meals & Entertainment">
                    <Dropdown.Item eventKey="Restaurants/Dining" onSelect={(ev,e)=>{setCategory(ev)}}>Restaurant/Dining</Dropdown.Item>
                    <Dropdown.Item eventKey="Entertainment" onSelect={(ev,e)=>{setCategory(ev)}}>Entertainment</Dropdown.Item>
                    </Dropdown.Menu>
                    <Dropdown.Menu title="Office Expense & Postage">
                    <Dropdown.Item eventKey="Printing Expenses" onSelect={(ev,e)=>{setCategory(ev)}}>Printing Expenses</Dropdown.Item>
                    <Dropdown.Item eventKey="Shipping Courier/Packaging" onSelect={(ev,e)=>{setCategory(ev)}}>Shipping Courier/Packaging</Dropdown.Item>
                    <Dropdown.Item eventKey="Software expenses" onSelect={(ev,e)=>{setCategory(ev)}}>Software expenses</Dropdown.Item>
                    <Dropdown.Item eventKey="Officee Stationary" onSelect={(ev,e)=>{setCategory(ev)}}>Officee Stationary</Dropdown.Item>
                    </Dropdown.Menu>
                    <Dropdown.Menu title="Rent or Lease">
                    <Dropdown.Item eventKey="Equipment Rent" onSelect={(ev,e)=>{setCategory(ev)}}>Equipment Rent</Dropdown.Item>
                    <Dropdown.Item eventKey="Machinary Rent" onSelect={(ev,e)=>{setCategory(ev)}}>Machinary Rent </Dropdown.Item>
                    <Dropdown.Item eventKey="OfficeSpace Rent" onSelect={(ev,e)=>{setCategory(ev)}}>OfficeSpace Rent</Dropdown.Item>
                    <Dropdown.Item eventKey="Vehicles Rent" onSelect={(ev,e)=>{setCategory(ev)}}>Vehicles Rent</Dropdown.Item>
                    </Dropdown.Menu>
                    <Dropdown.Menu title="Travel">
                    <Dropdown.Item eventKey="Air Travel" onSelect={(ev,e)=>{setCategory(ev)}}>Air Travel</Dropdown.Item>
                    <Dropdown.Item eventKey="Train Travel" onSelect={(ev,e)=>{setCategory(ev)}}>Train Travel</Dropdown.Item>
                    <Dropdown.Item eventKey="Raod Travel" onSelect={(ev,e)=>{setCategory(ev)}}>Raod Travel</Dropdown.Item>
                    </Dropdown.Menu>
                    <Dropdown.Menu title="Client Hosting">
                    <Dropdown.Item eventKey="Client Hosting Team Lunch" onSelect={(ev,e)=>{setCategory(ev)}}> Client Hosting Team Lunch</Dropdown.Item>
                    <Dropdown.Item eventKey="Client Hosting Mileage Expenses" onSelect={(ev,e)=>{setCategory(ev)}}>Client Hosting Mileage Expenses</Dropdown.Item>
                    <Dropdown.Item eventKey="Client Hosting Others" onSelect={(ev,e)=>{setCategory(ev)}}>Client Hosting Others</Dropdown.Item>
                    </Dropdown.Menu>
                    <Dropdown.Menu title="Utilities">
                    <Dropdown.Item eventKey="Electrical Utilities" onSelect={(ev,e)=>{setCategory(ev)}}>Electrical Utilities</Dropdown.Item>
                    <Dropdown.Item eventKey="Telephone Utilities" onSelect={(ev,e)=>{setCategory(ev)}}>Telephone Utilities</Dropdown.Item>
                    </Dropdown.Menu>
                    <Dropdown.Item eventKey="Others" onSelect={(ev,e)=>{setCategory(ev)}}>Others</Dropdown.Item>
                    </Dropdown>
                </ButtonToolbar> 
                </div>
                {/* check the validation and throw the error */}
                {validation && category === 'Select Category' ? <div style={{color:'red'}}>Please Select Category</div> :null}
            </div>
            <div className='form-group'>                
                <label>Project Name</label>
                <br></br>
                {projectOthersShow ? 
                <input type="text" value={projectName} onChange={(e)=>setProjectName(e.target.value)}  className="form-control input-field" placeholder="Enter here" />
                :
                <select  className='form-select form-control' onChange={(e)=>handleProjectName(e.target.value)} defaultValue={projectName} >
                <option value="" disabled>Select project name</option>
                {projects.map((e,i)=>(
                <option value={e} key={i}>{e}</option>))}
                <option value="Others">Others</option>
                </select>
                }
                { projectOthersShow && <FaList className ="projectlist-icon"  onClick={()=>handleProjectName("Not Others")}></FaList>}
                {/* check the validation and throw the error */}
                {validation && projectName === '' ? <div style={{color:'red'}}>Select Project Name</div> :null}
                <br/>
            </div>
        </div>
        </div>
        <div className='col-sm-12 col-md-12 col-lg-4' style={{padding:'0rem 4rem 0rem 4rem'}}>
        
        <label>Invoice No </label>
        <input type="text" value={billno} onChange={(e)=>setBillno(e.target.value)}  className="form-control input-field" placeholder="Enter Invoice No"  />
        {/* check the validation and throw the error */}
        {validation && billno === "" ? <div style={{color:'red'}}>Please Enter Invoice No.</div>: null}
        <br/>
//need comments
        <label>Amount</label>   
        <div className='input-group'>   
        <input type="number" value={amount} onChange={(e)=>handleAmount(e.target.value)} min="0" onPaste={preventPasteNegative} onKeyPress={preventMinus} className="form-control" placeholder="Enter amount" />

        <div className='input-group-append'>
        <select  className='form-select form-control' value={from} onChange={(e)=>handleCurrency(e.target.value)}>
        <option  disabled>Select your currency</option>
        {currencies.map((e,i)=>(
        <option value={e} key={i}>{e.toUpperCase()}</option>))}
        </select>
        </div>
        </div>
        {/* check the validation and throw the error */}
        {validation && amount === 0 ? <div style={{color:'red'}}>Please Enter Amount</div> : null}
        <br/>
        
        {/* <div style={{width:"100%"}}> */}
        <label>Amount in Rupees</label>
        <input type="number" value={amountINR} onChange={(e)=>setAmount(e.target.value)}  className="form-control" placeholder="Enter amount" required disabled/>
        {/* {amountError && amount.length > 1 &&  <p className="text-danger">Invalid Amount</p>} */}
        {/* </div> */}
        <br></br>
        <label>Invoice Date </label>
        <DatePicker className="form-control" id="datepicker" format='d/MM/yy' style={{border:"none",color:'#2A1CA7'}}  onChange={(date) => handleDate(date)}  value={billDate} />
        <br></br>
        <label>Description</label>
        <textarea style={{height:"38px"}} value={desc} onChange={(e)=>setDesc(e.target.value)}  className="form-control" placeholder="Enter Description" ></textarea>
        {/* check the validation and throw the error */}
        {validation && desc === '' ? <div style={{color:'red'}}>Please Write Description</div>:null}
        
        <br/>
        </div>
        <div className='col-sm-12 col-md-12 col-lg-4' style={{padding:'0rem 4rem 0.5rem 4rem'}} >
        
        <label>Upload Receipt</label>
        <section >
        <div
        style= { {
            cursor: "pointer",
            background: "#F0F2F8",
            height: "295px",
            width:'auto',
            borderRadius :'0.25rem'
        } }
        {...getRootProps({className:'dropzone'})}
        >
        <input  {...getInputProps()} />
        <center>
        <div style={{}}>
        <p style={{paddingTop:'1rem'}}><AiOutlineCloudUpload fontSize='5rem'/></p>
        <p className='dropzone'>Drag & Drop </p>
        <p className='dropzone2'>Your file to assets ,or <span style={{fontSize:'18px', color:'#2A1CA7',textDecoration:'underline'}}>Browse</span></p>
        <br></br>
        <h6>(Only .jpeg ,.jpg,.png and *.pdf formats will be accepted)</h6>
        </div>
        </center>
        </div>
        <aside style={{height:'32px'}}>
        <h6>* Accepted Files will display below</h6>
        <ul style={{height:'45px',overflow:'scroll'}}>{acceptedFileItems}</ul>
        </aside>
        </section>
        {/* check the validation and throw the error */}
        {validation && img === null ? <div style={{color:'red'}}> Please Upload Receipt</div> : null }
        <ul style={{color:'red'}}>{fileRejectionItems}</ul>
        <br></br>
        <div className='' style={{display:'flex',justifyContent:'space-evenly'}}>
        <div>
        {!stateCreateBill.loading && <button className="page-button"  type="submit">Submit</button>}
        </div>
        <div style={{marginLeft:'30px'}}>
        <button type="button" onClick={() => window.history.back()} className="page-cancel-button" data-bs-dismiss="modal">Cancel</button>
        </div>
        </div>
        </div>
        </div> 
        </form>
        </Container>
        <center>
        {stateCreateBill.loading && <Loading/>}
        </center>
        <Modal show={reportingOthersShow} onHide={()=>setReportingOthersShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Choose Person</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <select  className="form-select form-control" value={reportingToName} onChange={(e)=>handleReportingTo(e.target.value)} >
                {type && (type ==="employee" || type ==="manager") ? <option value="" selected disabled>Select your Reporting Manager</option>:<option selected value="" disabled>Forward to</option>}
                {toReceiveList.filter((val)=>{
                if(userInfo && val["email"] !== userInfo.email) {
                    return val;
                }
                }).map((e,i)=>(
                <option value={JSON.stringify(e)} key={i}>{e.fullName}</option>))}
            </select>
        </Modal.Body>
        <Modal.Footer>
          
          <button variant="primary"  className="page-button" onClick={()=>setReportingOthersShow(false)}>
            Confirm
          </button>
        </Modal.Footer>
      </Modal>

        </>
    );

}