import React, { useEffect, useState } from 'react'
import { useCart } from '../context/CartContext'
import { FaRegTrashAlt } from 'react-icons/fa';
import { LuNotebookText } from 'react-icons/lu';
import { MdDeliveryDining } from 'react-icons/md';
import { GiShoppingBag } from 'react-icons/gi';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import emptyCart from "../assets/empty-cart.png"
import deliveryImage from "../assets/delivery.svg"

const Cart = ({location, getLocation}) => {
  const { cartItem , updateQuantity, deleteItem, setCartItem } = useCart()
  const {user} = useUser()
  const navigate = useNavigate()
  const [customerName, setCustomerName] = useState(user?.fullName || "")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [address1, setAddress1] = useState("")
  const [stateName, setStateName] = useState("")
  const [postCode, setPostCode] = useState("")
  const [country, setCountry] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("Google Pay")
  const [promoCode, setPromoCode] = useState("")
  const [promoApplied, setPromoApplied] = useState(false)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [promoMessage, setPromoMessage] = useState("")
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderNumber, setOrderNumber] = useState("")

  useEffect(() => {
    if (location) {
      setAddress1(location.city || location.town || location.village || location.suburb || location.hamlet || location.county || "Chennai")
      setStateName(location.state || location.region || "Tamil Nadu")
      setPostCode(location.postcode || "")
      setCountry(location.country || "India")
    }
  }, [location])

  const totalPrice = cartItem.reduce((total, item) => total + item.price * (item.quantity || 1), 0)
  const grandTotal = Math.max(0, totalPrice + 5 - discountAmount)

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase()
    if (!code) {
      toast.error("Enter a promo code first.")
      return
    }

    if (code === "ZAP10" || code === "SAVE10") {
      const discount = Math.round(totalPrice * 0.1 * 100) / 100
      setDiscountAmount(discount)
      setPromoApplied(true)
      setPromoMessage(`Promo applied: ${code} (-$${discount.toFixed(2)})`)
      toast.success("Promo code applied successfully!")
    } else if (code === "WELCOME5") {
      setDiscountAmount(5)
      setPromoApplied(true)
      setPromoMessage("Promo applied: WELCOME5 (-$5.00)")
      toast.success("Promo code applied successfully!")
    } else {
      setPromoApplied(false)
      setDiscountAmount(0)
      setPromoMessage("Invalid promo code. Try ZAP10, SAVE10, or WELCOME5.")
      toast.error("Invalid promo code.")
    }
  }

  const handleCheckout = () => {
    if (!cartItem.length) {
      toast.error("Add items to your cart before checkout.")
      return
    }
    if (!customerName || !address1 || !phoneNumber) {
      toast.error("Please complete your delivery details before checkout.")
      return
    }

    const orderId = `ZAP-${Math.floor(Math.random() * 900000 + 100000)}`
    setOrderNumber(orderId)
    setOrderPlaced(true)
    toast.success(`Order ${orderId} placed with ${paymentMethod}!`) 
    setCartItem([])
  }

  return (
    <div className='mt-10 max-w-6xl mx-auto mb-5 px-4 md:px-0'>
      {
        orderPlaced ? (
          <div className='bg-white rounded-md p-8 shadow-lg text-center'>
            <h1 className='text-3xl font-bold text-green-600 mb-4'>Order Confirmed!</h1>
            <p className='text-gray-700 mb-2'>Order ID: <span className='font-semibold'>{orderNumber}</span></p>
            <p className='text-gray-700 mb-4'>Your order has been placed with {paymentMethod}. We will deliver to <strong>{location?.displayName || `${address1}, ${stateName}`}</strong>.</p>
            {promoApplied ? <p className='text-green-600 mb-4'>Promo applied: {promoMessage}</p> : null}
            <div className='flex flex-col items-center gap-4'>
              <img src={deliveryImage} alt='Delivery on the way' className='w-72 mx-auto' />
              <p className='text-gray-700 font-medium'>Your delivery partner is on the way and will reach <strong>{location?.displayName || `${address1}, ${stateName}`}</strong> soon.</p>
              <p className='text-sm text-gray-500'>Track your delivery in the app and be ready to receive your package.</p>
            </div>
            <button onClick={() => { setOrderPlaced(false); navigate('/products'); }} className='mt-6 bg-red-500 text-white px-5 py-2 rounded-md'>Continue Shopping</button>
          </div>
        ) : cartItem.length > 0 ? <div>
          <h1 className='font-bold text-2xl '>My Cart ({cartItem.length})</h1>
          <div>
            <div className='mt-10'>
              {cartItem.map((item, index) => {
                return <div key={index} className='bg-gray-100 p-5 rounded-md flex items-center justify-between mt-3 w-full'>
                  <div className='flex items-center gap-4'>
                    <img src={item.image} alt={item.title} className='w-20 h-20 rounded-md' />
                    <div>
                      <h1 className='md:w-[300px] line-clamp-2 '>{item.title}</h1>
                      <p className='text-red-500 font-semibold text-lg'>${item.price}</p>
                    </div>
                  </div>
                  <div className='bg-red-500 text-white flex gap-4 p-2 rounded-md font-bold text-xl'>
                    <button onClick={()=>updateQuantity(cartItem, item.id, "decrease")} className='cursor-pointer'>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={()=>updateQuantity(cartItem, item.id, "increase")} className='cursor-pointer'>+</button>
                  </div>
                  <span onClick={()=>deleteItem(item.id)} className='hover:bg-white/60 transition-all rounded-full p-3 hover:shadow-2xl'>
                    <FaRegTrashAlt className='text-red-500 text-2xl cursor-pointer' />
                  </span>
                </div>
              })}
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 md:gap-20'>
              <div className='bg-gray-100 rounded-md p-7 mt-4 space-y-4'>
                <h1 className='text-gray-800 font-bold text-xl'>Delivery Info</h1>
                <div className='flex flex-col space-y-1'>
                  <label htmlFor="">Full Name</label>
                  <input type="text" placeholder='Enter your name' className='p-2 rounded-md' value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                </div>
                <div className='flex flex-col space-y-1'>
                  <label htmlFor="">Address</label>
                  <input type="text" placeholder='Enter your address' className='p-2 rounded-md' value={address1} onChange={(e) => setAddress1(e.target.value)} />
                </div>
                <div className='flex w-full gap-5'>
                  <div className='flex flex-col space-y-1 w-full'>
                    <label htmlFor="">State</label>
                    <input type="text" placeholder='Enter your state' className='p-2 rounded-md w-full' value={stateName} onChange={(e) => setStateName(e.target.value)} />
                  </div>
                  <div className='flex flex-col space-y-1 w-full'>
                    <label htmlFor="">PostCode</label>
                    <input type="text" placeholder='Enter your postcode' className='p-2 rounded-md w-full' value={postCode} onChange={(e) => setPostCode(e.target.value)} />
                  </div>
                </div>
                <div className='flex w-full gap-5'>
                  <div className='flex flex-col space-y-1 w-full'>
                    <label htmlFor="">Country</label>
                    <input type="text" placeholder='Enter your country' className='p-2 rounded-md w-full' value={country} onChange={(e) => setCountry(e.target.value)} />
                  </div>
                  <div className='flex flex-col space-y-1 w-full'>
                    <label htmlFor="">Phone No</label>
                    <input type="text" placeholder='Enter your number' className='p-2 rounded-md w-full' value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                  </div>
                </div>
                <div className='flex flex-wrap gap-2'>
                  {['Google Pay','PhonePe','Paytm','Cash on Delivery'].map(method => (
                    <button
                      key={method}
                      type='button'
                      className={`px-3 py-2 rounded-md border ${paymentMethod === method ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-300 text-gray-700'} cursor-pointer`}
                      onClick={() => setPaymentMethod(method)}
                    >
                      {method}
                    </button>
                  ))}
                </div>
                <div className='flex items-center justify-center w-full text-gray-700'>
                  OR use current location
                </div>
                <div className='flex justify-center'>
                  <button onClick={getLocation} className='bg-red-500 text-white px-3 py-2 rounded-md'>Detect Location</button>
                </div>
              </div>
              <div className='bg-white border border-gray-100 shadow-xl rounded-md p-7 mt-4 space-y-4 h-max'>
                <h1 className='text-gray-800 font-bold text-xl'>Bill details</h1>
                <div className='flex justify-between items-center'>
                  <h1 className='flex gap-1 items-center text-gray-700'><span><LuNotebookText /></span>Items total</h1>
                  <p>${totalPrice.toFixed(2)}</p>
                </div>
                <div className='flex justify-between items-center'>
                  <h1 className='flex gap-1 items-center text-gray-700'><span><MdDeliveryDining /></span>Delivery Charge</h1>
                  <p className='text-red-500 font-semibold'><span className='text-gray-600 line-through'>$25</span> FREE</p>
                </div>
                <div className='flex justify-between items-center'>
                  <h1 className='flex gap-1 items-center text-gray-700'><span><GiShoppingBag /></span>Handling Charge</h1>
                  <p className='text-red-500 font-semibold'>$5</p>
                </div>
                <hr  className='text-gray-200 mt-2'/>
                <div className='flex justify-between items-center'>
                  <h1 className='font-semibold text-lg'>Grand total</h1>
                  <p className='font-semibold text-lg'>${grandTotal.toFixed(2)}</p>
                </div>
                <div>
                  <h1 className='font-semibold text-gray-700 mb-3 mt-7'>Apply Promo Code</h1>
                  <div className='flex gap-3'>
                    <input
                      type="text"
                      placeholder='Enter code'
                      className='p-2 rounded-md w-full'
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      disabled={promoApplied}
                    />
                    <button
                      type='button'
                      className={`px-4 py-1 rounded-md ${promoApplied ? 'bg-gray-300 text-gray-700' : 'bg-black text-white'}`}
                      onClick={handleApplyPromo}
                      disabled={promoApplied}
                    >
                      {promoApplied ? 'Applied' : 'Apply'}
                    </button>
                  </div>
                  {promoMessage ? <p className='text-sm mt-2 text-green-600'>{promoMessage}</p> : null}
                </div>
                {discountAmount > 0 ? (
                  <div className='flex justify-between items-center text-green-600 font-semibold'>
                    <span>Promo discount</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                ) : null}
                <div className='space-y-2'>
                  <p className='text-gray-700'>Selected payment: <span className='font-semibold'>{paymentMethod}</span></p>
                  <button onClick={handleCheckout} className='bg-red-500 text-white px-3 py-2 rounded-md w-full cursor-pointer mt-3'>Proceed to Checkout</button>
                </div>
              </div>
            </div>
          </div>
        </div> : <div className='flex flex-col gap-3 justify-center items-center h-[600px]'>
          <h1 className='text-red-500/80 font-bold text-5xl text-muted'>Oh no! Your cart is empty</h1>
          <img src={emptyCart} alt="" className='w-[400px]'/>
          <button onClick={()=>navigate('/products')} className='bg-red-500 text-white px-3 py-2 rounded-md cursor-pointer '>Continue Shopping</button>
        </div>
      }
    </div>
  )
}

export default Cart
