import React, { useEffect, useState } from 'react';
import axios from 'axios';
// import Navbar from './Navbar'; 
import './Products.css'

export default function GroupedProducts() {
  const [products, setProducts] = useState({});

  useEffect(() => {
    axios.get('http://localhost:5000/api/products/getAllProducts')
      .then(res => {
        const allProducts = res.data.data;
        const grouped = {};

        allProducts.forEach(product => {
          const category = product.category || 'Others';
          if (!grouped[category]) {
            grouped[category] = [];
          }
          grouped[category].push(product);
        });

        setProducts(grouped);
      })
      .catch(err => {
        console.error("Error fetching products:", err);
      });
  }, []);

  return (
    <>
    

    {/* <Navbar/>  */}

    <div>
      {Object.entries(products).map(([category, items], index) => (
        <div key={index}>
          <h2>{category}</h2>
          <div className='productcontainer'>
            {items.map((product, idx) => (
              <div key={idx} className='productcard'>
                <img src={`http://localhost:5000${product.image?.[0]?.url}`} alt={product.name} className='productimage'/>
                <h3 className='productname'>{product.name}</h3>
                <p className='productdesc'>{product.description}</p>
                <p className='productprice'>Rs - ₹{product.price}</p>
                <button className='buynow'>Buy Now</button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>

    </>
  );
}
