import './App.css'
import 'antd/dist/reset.css'; // for Ant Design 5.x

//import GoogleMapComponent from './GoogleMap';
import GoogleMapComponent from './components/googleMapComponent';

function App() {

  return (
    <>
     <div className="App">
      <GoogleMapComponent />
    </div>
    </>
  )
}

export default App
