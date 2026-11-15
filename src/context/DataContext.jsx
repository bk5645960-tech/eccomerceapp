import axios from "axios";
import { createContext, useContext, useState } from "react";

export const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
    const [data, setData] = useState()

    // fetching all products from api
    const fetchAllProducts = async () => {
        try {
           const res = await axios.get('https://fakestoreapi.com/products?limit=150')
           console.log(res);
           const productsData = res.data
           setData(productsData)
           
        } catch (error) {
            console.log(error);

        }
    }

    const CATEGORY_ORDER = ["electronics", "jewelery", "men's clothing", "women's clothing"]
    const CATEGORY_LABELS = {
        "electronics": "Electronics",
        "jewelery": "Jewelry",
        "men's clothing": "Men's Clothing",
        "women's clothing": "Women's Clothing",
        "All": "All"
    }

    const getUniqueCategory = (data, property) =>{
        let newVal = data?.map((curElem) =>{
            return curElem[property]
        }).filter(Boolean)
        newVal = [...new Set(newVal)]
        const ordered = [
            ...CATEGORY_ORDER.filter(item => newVal.includes(item)),
            ...newVal.filter(item => !CATEGORY_ORDER.includes(item))
        ]
        return ["All", ...ordered]
      }
    
      const formatCategoryLabel = (category) => CATEGORY_LABELS[category] || category?.replace(/(^|\s)\S/g, t => t.toUpperCase()) || ""
      const categoryOnlyData = getUniqueCategory(data, "category")
      const brandOnlyData = getUniqueCategory(data, "brand")
    return <DataContext.Provider value={{ data, setData, fetchAllProducts, categoryOnlyData, brandOnlyData, formatCategoryLabel }}>
        {children}
    </DataContext.Provider>
}

export const getData = ()=> useContext(DataContext)
