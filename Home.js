import "../styles/Home.css";
import { HomePendingBills } from './HomePendingBills';
import HomeUploadedBills from './HomeUploadedBills';
import * as Reducer from '../store/reducers/userReducer.js';
import { useEffect, useReducer, useState } from 'react';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';

const Home=()=>{
    const [value, setValue] = useState('1');
    const [stateLogin,] = useReducer(Reducer.LoginReducer,Reducer.initialState);  
    const userInfo = stateLogin.userInfo ? stateLogin.userInfo : null;
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };
    //its reload the page when the user switch their roles 
    useEffect(()=>{
      if(!userInfo){
          window.location.replace("/login")
      }
    },[userInfo])
     
    return(
        <>  
        <div className="row" style={{margin:'0'}} >
            {userInfo && 
            userInfo.type !== "admin" && <div className="col-xs-11 col-md-11 col-lg-11 col1"     
            <Box   sx={{ width: '100%', typography: 'body1' }}>
                <TabContext value={value}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider',height:'39px',transform:'translateX(-13px)' }}>
                        <TabList onChange={handleChange} aria-label="lab API tabs example" >
                            {/*To display the various pages in dashboard to various users/roles  */}
                            {userInfo && 
                            userInfo.type !== "admin" && 
                            userInfo.type !== "cco" && 
                            userInfo.type !== "vo" && 
                            userInfo.type !== "ao" &&
                            <Tab 
                                className="text-responsive" 
                                label="My Reports" 
                                value="1"
                            />
                            }
                      
                            {userInfo && 
                            userInfo.type !== "employee" && 
                            userInfo.type !== "admin" && 
                            userInfo.type !== "management" &&
                            <Tab 
                                className="text-responsive" 
                                label="For Approval" 
                                value={
                                    (userInfo.type !== "ao" ||
                                    userInfo.type !== "cco" || 
                                    userInfo.type !=="vo")  && 
                                    userInfo.type !=="manager" ? "1" : "2"
                                }
                            /> 
                            } 
                        </TabList>
                    </Box>
                  
                    {/*To display the various pages in dashboard to various users/roles  */}
                    {userInfo && 
                    userInfo.type !== "admin" && 
                    userInfo.type !== "cco" && 
                    userInfo.type !== "ao" && 
                    userInfo.type !== "vo" && 
                    <>
                    <TabPanel value="1">
                        <HomeUploadedBills/>
                    </TabPanel>
                    </>
                    }
                    
                  {((userInfo.type === "vo") ||
                  (userInfo.type === 'cco') || 
                  (userInfo.type==='ao')) ? 
                  <>
                  <TabPanel value="2">
                      <HomePendingBills/>
                  </TabPanel>
                  </> :
                  <>
                  <TabPanel value="2">
                      <HomePendingBills/>
                  </TabPanel>
                  </>}

                </TabContext>
            </Box>
        </div
        }
        </div>
            {userInfo && 
            userInfo.type === "admin" && 
            <div>
              <center>
                  <h1>Working on Dashboard</h1>
              </center>
          </div>}
        </>
  );
}
export default Home