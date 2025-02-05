import { useEffect, useState } from "react";

export const useVentas = () => {
    const [count, setCount] = useState({});
    const [busqueda, setBusqueda] = useState('');
    const [producto, setProducto] = useState([]);
    const [productosFiltrados, setProductosFiltrados] = useState(producto);
    const [refreshData, setRefreshData] = useState(false);
    const [productosCarrito, setProductosCarrito] = useState([]);

    useEffect(() => {
        getDataInit();
    }, []);
  
    useEffect(() => {
        getDataInit();
    }, [refreshData]);

    useEffect(() => {
        const resultados = producto.filter(producto =>
            producto.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
            producto.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
        );
        setProductosFiltrados(resultados);
    }, [busqueda, producto]);

    const getDataInit = async () => {
        try {
            const response = await fetch('http://localhost:3001/productos');
            if (!response.ok) {
                throw new Error('Error al obtener productos: ' + response.statusText);
            }
            const result = await response.json();
            orderProductsById(result);
            console.log('Datos obtenidos:', result);
            return result;
        } catch (error) {
            console.error('Error:', error.message);
            throw new Error('Error en la solicitud: ' + error.message);
        }
    };

    const orderProductsById = (products) => {
        const productsOrder = products.sort((a, b) => a.id - b.id);
        setProducto(productsOrder);
    }

    const addProduct = (idProducto) => {
        const productoExistente = productosCarrito.find(item => item.id === idProducto);
        if (productoExistente) {
            alert('Este producto ya está en el carrito');
            return;
        }
        
        const productoNuevo = producto.find(producto => producto.id === idProducto);
        if (!productoNuevo) {
            alert('Producto no encontrado');
            return;
        }

        if (productoNuevo.cantidad <= 0) {
            alert('Este producto no tiene unidades disponibles');
            return;
        }

        setCount(prevCount => ({
            ...prevCount,
            [idProducto]: 1
        }));
        
        setProductosCarrito([...productosCarrito, { ...productoNuevo, cantidadCarrito: 1 }]);
    }

    const handleAddProduct = (idProducto) => {
        const productoActual = producto.find(p => p.id === idProducto);
        const cantidadActualCarrito = count[idProducto] || 0;
    
        if (cantidadActualCarrito >= productoActual.cantidad) {
            alert('No hay más unidades disponibles de este producto');
            return;
        }
    
        setCount(prevCount => ({
            ...prevCount,
            [idProducto]: (prevCount[idProducto] || 0) + 1
        }));
    
        setProductosCarrito(prevProductos => 
            prevProductos.map(producto => 
                producto.id === idProducto 
                    ? { ...producto, cantidadCarrito: cantidadActualCarrito + 1 }
                    : producto
            )
        );
    }
    
    const handleRemoveProduct = (idProducto) => {
        const cantidadActualCarrito = count[idProducto];
    
        if (cantidadActualCarrito === 1) {
            setProductosCarrito(prevProductos => 
                prevProductos.filter(p => p.id !== idProducto)
            );
            setCount(prevCount => {
                const newCount = { ...prevCount };
                delete newCount[idProducto];
                return newCount;
            });
        } else {
            setCount(prevCount => ({
                ...prevCount,
                [idProducto]: prevCount[idProducto] - 1
            }));
    
            setProductosCarrito(prevProductos => 
                prevProductos.map(producto => 
                    producto.id === idProducto 
                        ? { ...producto, cantidadCarrito: cantidadActualCarrito - 1 }
                        : producto
                )
            );
        }
    }

    const formatText = (text) => {
        if (text == null) {
            return text;
        }
        if (text.length > 30) {
            return text.slice(0, 30) + '...';
        }
        return text;
    };

    return {
        count,
        handleAddProduct,
        handleRemoveProduct,
        formatText,
        busqueda,
        setBusqueda,
        productosFiltrados,
        addProduct,
        productosCarrito
    }
}