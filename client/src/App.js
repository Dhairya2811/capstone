// import React from "react";
// import { Routes, Route } from "react-router-dom";
// import Navigationbar from "../Navigationbar/Navigationbar";
// import Index from "../Index/Index";
// import SignIn from "../SignIn/SignIn";
// import Register from "../Register/Register"
// import AddItem from "../AddItem/AddItem";
// import ItemDetails from "../ItmeDetails/ItemDetails"; 
// import MyCart from "../MyCart/MyCart";
// import MyItem from "../MyItem/MyItem";
// import Payment from "../Payment/Payment";
// import Error404 from "../Error404/Error404";
// import PostAd from "../PostAd/PostAd";
// import HigestSell from "../HigestSell/HigestSell";
// import UsersAndData from "../UsersAndData/UsersAndData";

// class App extends React.Component{
//     render(){
//         return (
//             <div className="App">
//                 <Navigationbar />
//                 <div className="body">
//                     <Routes>
//                             <Route exact path="/" element={<Index />}/>
//                             <Route path="/category/:name" element={<Index />} />
//                             <Route path="/search/:search_by" element={<Index />} />
//                             <Route path="/register" element={<Register/>}/>
//                             <Route path="/signin" element={<SignIn/>}/>
//                             <Route path="/addItem" element={<AddItem role="new"/>}/>
//                             <Route path="/details/:id" element={<ItemDetails />} />
//                             <Route path="/myCart" element={<MyCart />} />
//                             <Route path="/myCart/category/:name" element={<MyCart />} />
//                             <Route path="/myItems" element={<MyItem />} />
//                             <Route path="/myItems/category/:name" element={<MyItem />} />
//                             <Route path="/editItem/:id" element={<AddItem role="edit"/>} />
//                             <Route path="/payment" element={<Payment />}/>
//                             <Route path="/postad" element={<PostAd />}/>
//                             <Route path="/higestSale" element={<HigestSell />}/>
//                             <Route path="/usersAndData" element={<UsersAndData />} />
//                             <Route path="/usersAndData/search/:search_by" element={<UsersAndData />} />
//                             <Route path="*" element={<Error404 />}/>
//                     </Routes>
//                 </div>
//             </div>
//         );
//     }
// };

// export default App;


import React from 'react';

function App(){
  return (
    <div>
      App
    </div>
  )
}

export default App;