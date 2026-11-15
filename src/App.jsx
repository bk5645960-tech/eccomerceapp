import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Products from './pages/Products'
import About from './pages/About'
import Contact from './pages/Contact'
import Cart from './pages/Cart'
import Navbar from './components/Navbar'
import axios from 'axios'
import Footer from './components/Footer'
import SingleProduct from './pages/SingleProduct'
import CategoryProduct from './pages/CategoryProduct'
import { useCart } from './context/CartContext'
import ProtectedRoute from './components/ProtectedRoute'


const App = () => {
  const DEFAULT_LOCATION = {
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    displayName: 'Chennai, Tamil Nadu'
  }

  const formatAddress = (address) => {
    if (!address) return DEFAULT_LOCATION.displayName
    const city = address.city || address.town || address.village || address.suburb || address.hamlet || address.county
    const state = address.state || address.region
    if (!city && !state) return DEFAULT_LOCATION.displayName
    return [city, state].filter(Boolean).join(', ')
  }

  const normalizeStoredLocation = (stored) => {
    if (!stored || typeof stored !== 'object') return null
    const city = stored.city || stored.town || stored.village || stored.suburb || stored.hamlet || stored.county || ''
    const display = stored.displayName || ''
    const stalePattern = /Pattabiram|Avadi|ABaAm/i
    if (stalePattern.test(city) || stalePattern.test(display)) {
      return DEFAULT_LOCATION
    }
    return {
      ...stored,
      displayName: display || formatAddress(stored)
    }
  }

  const getStoredLocation = () => {
    try {
      const saved = localStorage.getItem('userLocation')
      return saved ? normalizeStoredLocation(JSON.parse(saved)) : null
    } catch (error) {
      return null
    }
  }

  const [location, setLocation] = useState(DEFAULT_LOCATION)
  const [openDropdown, setOpenDropdown] = useState(false)
  const { cartItem, setCartItem } = useCart()

  const saveLocation = (locationValue) => {
    try {
      localStorage.setItem('userLocation', JSON.stringify(locationValue))
    } catch (error) {
      console.log('Failed to save location', error)
    }
  }

  const updateLocation = (locationValue) => {
    const normalized = {
      ...locationValue,
      displayName: locationValue.displayName || formatAddress(locationValue),
      city: locationValue.city || locationValue.town || locationValue.village || locationValue.suburb || locationValue.hamlet || locationValue.county || DEFAULT_LOCATION.city,
      state: locationValue.state || locationValue.region || DEFAULT_LOCATION.state,
      country: locationValue.country || DEFAULT_LOCATION.country,
    }
    setLocation(normalized)
    saveLocation(normalized)
  }

  const getLocation = async () => {
    navigator.geolocation.getCurrentPosition(async pos => {
      const { latitude, longitude } = pos.coords
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
      try {
        const response = await axios.get(url)
        const exactLocation = response.data.address
        const newLocation = exactLocation ? {
          ...exactLocation,
          displayName: formatAddress(exactLocation)
        } : DEFAULT_LOCATION
        updateLocation(newLocation)
        setOpenDropdown(false)
      } catch (error) {
        console.log(error)
        const fallback = getStoredLocation() || DEFAULT_LOCATION
        setLocation(fallback)
      }
    }, () => {
      const fallback = getStoredLocation() || DEFAULT_LOCATION
      setLocation(fallback)
    })
  }

  useEffect(() => {
    const storedLocation = getStoredLocation()
    if (storedLocation) {
      setLocation(storedLocation)
    }
    getLocation()
  }, [])

  //Load cart from local storage on initial render
  useEffect(() => {
    const storedCart = localStorage.getItem('cartItem')
    if(storedCart){
      setCartItem(JSON.parse(storedCart))
    }
  }, []);

  //save cart to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('cartItem', JSON.stringify(cartItem))
  }, [cartItem])

  return (
    <BrowserRouter>
      <Navbar location={location} getLocation={getLocation} updateLocation={updateLocation} openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} />
      <Routes>
        <Route path='/' element={<Home />}></Route>
        <Route path='/products' element={<Products />}></Route>
        <Route path='/products/:id' element={<SingleProduct />}></Route>
        <Route path='/category/:category' element={<CategoryProduct />}></Route>
        <Route path='/about' element={<About />}></Route>
        <Route path='/contact' element={<Contact />}></Route>
        <Route path='/cart' element={<Cart location={location} getLocation={getLocation} />}></Route>
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}

export default App
