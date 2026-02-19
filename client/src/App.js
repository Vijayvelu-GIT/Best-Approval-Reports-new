
import './App.css';
import { registerLicense } from '@syncfusion/ej2-base';
import LoginPage from "./LoginPage/LoginPage"
import HomePage from "./HomePage/HomePage";
import FabricOrderApproval from "./Pages/FabricOrderApproval"
import { BrowserRouter, Route, Routes } from 'react-router-dom';

// Register Syncfusion license key
// registerLicense('ORg4AjUWIQA/Gnt2XFhhQlJHfV5AQmBIYVp/TGpJfl96cVxMZVVBJAtUQF1hTH5WdExjWn1ac3BTRmddWkZ/');

registerLicense('Ngo9BigBOggjHTQxAR8/V1JGaF5cXGpCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdlWX5fcHRRQ2RZU0V+W0pWYEs=')




function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage/>} />
        <Route path="/home" element={<HomePage/>} />
        <Route path="/Fabric" element={<FabricOrderApproval/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
