import fs from 'fs/promises';   
import path from 'path';

class StockManager {
    constructor(path) {
        this.path = path;
    }

    // 1. MÉTODO PARA LEER EL STOCK LOCAL
    async getStock() {
        try {
            const data = await fs.readFile(this.path, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            return []; // Si no hay archivo o está vacío, devolvemos lista vacía
        }
    }

    // 2. MÉTODO PARA LA CARPETA DE AUDITORÍA DE FOTOS
    async getAuditImages() {
        try {
            const imgPath = './src/public/img';
            const files = await fs.readdir(imgPath);
            const images = files.filter(file => 
                ['.jpg', '.jpeg', '.png', '.webp'].includes(path.extname(file).toLowerCase())
            );
            return images; 
        } catch (error) {
            console.error("❌ Error al leer la carpeta de auditoría:", error);
            return [];
        }
    }

    // 3. MÉTODO PARA AGREGAR UN CORTE NUEVO
    async addProduct(product) {
        const stock = await this.getStock();
        product.id = stock.length > 0 ? stock[stock.length - 1].id + 1 : 1;
        stock.push(product);
        await fs.writeFile(this.path, JSON.stringify(stock, null, 2));
        return product;
    }

    // 4. MÉTODO PARA VENDER (DESCONTAR KILOS)
    // CAMBIO CLAVE: Acordate que en stock.routes.js convertimos el 'id' que viene del HTML 
    // con Number(id) para que este '===' estricto no falle al comparar número con texto.
    async sellProduct(id, kilosVendidos) {
        const stock = await this.getStock();
        const index = stock.findIndex(p => p.id === id);

        if (index !== -1) {
            if (stock[index].stockKilos >= kilosVendidos) {
                stock[index].stockKilos -= kilosVendidos;
                await fs.writeFile(this.path, JSON.stringify(stock, null, 2));
                return { success: true, product: stock[index] };
            }
            return { success: false, message: "No alcanza el stock en el mostrador" };
        }
        return { success: false, message: "No se encuentra ese corte de carne" };
    }

    // 5. MÉTODO PARA ACTUALIZAR DATOS DE UN PRODUCTO
    async updateProduct(id, camposNuevos) {
        const stock = await this.getStock();
        const index = stock.findIndex(p => p.id === id);

        if (index !== -1) {
            stock[index] = { ...stock[index], ...camposNuevos, id };
            await fs.writeFile(this.path, JSON.stringify(stock, null, 2));
            return { success: true, product: stock[index] };
        }
        return { success: false };
    }

    // 6. ALERTAS DE STOCK MÍNIMO (Muestra los que están por debajo del límite)
    async checkAlertas(limite) {
        const stock = await this.getStock();
        return stock.filter(p => p.stockKilos <= limite);
    }

    // 7. BALANCE GENERAL DEL MOSTRADOR
    // CAMBIO CRÍTICO ANTIBUGS: Blindamos el reduce. Si algún precio llega a guardarse como string
    // (ej: "$25000" o "25000 /kg"), la expresión regular limpia todo el texto de prepo y deja 
    // solo los números limpios. Así evitamos que la matemática devuelva un 'NaN' a la pantalla.
    async getBalance() {
        try {
            const stock = await this.getStock();
            
            // Sumamos el total de kilos en cámara
            const totalKilos = stock.reduce((acc, p) => acc + (Number(p.stockKilos) || 0), 0);
            
            // Calculamos el valor total en pesos de la mercadería
            const valorPesos = stock.reduce((acc, p) => {
                let precioCrudo = p.precio || p.precioKilo || 0;
                
                // Si el precio se guardó sin querer como un texto, lo limpiamos dejando solo números
                if (typeof precioCrudo === 'string') {
                    precioCrudo = precioCrudo.replace(/[^0-9]/g, ''); 
                }
                
                const precioActual = Number(precioCrudo) || 0;
                const kilosActuales = Number(p.stockKilos || 0);
                
                return acc + (precioActual * kilosActuales);
            }, 0);

            return {
                total_kilos_en_camara: totalKilos.toFixed(2),
                valor_total_inventario: valorPesos, // Propiedad que lee stock.routes.js (¡ojo las letras!)
                cantidad_de_cortes: stock.length,
                fecha_reporte: new Date().toLocaleString()
            };
        } catch (error) {
            console.error("❌ Error crítico al calcular el balance:", error);
            return {
                total_kilos_en_camara: "0.00",
                valor_total_inventario: 0,
                cantidad_de_cortes: 0,
                fecha_reporte: new Date().toLocaleString()
            };
        }
    }

    // 8. CÁLCULO DE RINDES DE MEDIA RES
    async balanceMediaRes(pesoBruto, preciosPublico, rindeEfectivo = 0.90) {
        const pesoUtil = pesoBruto * rindeEfectivo; 
        const tercio = pesoUtil / 3; 
        const valorPuchero = tercio * preciosPublico.puchero;
        const valorPulpa = tercio * preciosPublico.pulpa;
        const valorAsado = tercio * preciosPublico.asado;
        const totalVenta = valorPuchero + valorPulpa + valorAsado;

        return {
            kilosUtiles: pesoUtil.toFixed(2),
            detalle: {
                puchero: { kilos: tercio.toFixed(2), total: valorPuchero },
                pulpa: { kilos: tercio.toFixed(2), total: valorPulpa },
                asado: { kilos: tercio.toFixed(2), total: valorAsado }
            },
            reaccudaionTotal: totalVenta
        };
    }

    // 9. MÉTODO PARA ELIMINAR UN CORTE POR ID
    async deleteProduct(id) {
        try {
            const stock = await this.getStock();
            // Buscamos si existe el corte
            const existe = stock.some(p => p.id === id);
            
            if (!existe) {
                return { success: false, message: "No se encontró el corte para eliminar" };
            }

            // Filtramos el array para dejar afuera el ID que queremos borrar
            const nuevoStock = stock.filter(p => p.id !== id);
            
            // Guardamos el nuevo listado limpio en el archivo json
            await fs.writeFile(this.path, JSON.stringify(nuevoStock, null, 2));
            return { success: true };
        } catch (error) {
            console.error("❌ Error al eliminar producto en el manager:", error);
            return { success: false, message: "Error interno al escribir el archivo" };
        }
    }

    // 10. MÉTODO PARA AGREGAR UN PRODUCTO NUEVO
    async addProduct(productData) {
        try {
            const stock = await this.getStock();
            
            // Autogeneramos un ID sumando 1 al último que exista
            const nuevoId = stock.length > 0 ? Math.max(...stock.map(p => p.id)) + 1 : 1;
            
            const nuevoProducto = {
                id: nuevoId,
                title: productData.title,
                price: Number(productData.price) || 0,
                stockKilos: Number(productData.stockKilos) || 0,
                category: productData.category || "Varios",
                img: productData.img || "https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=500" // Una foto de carne genérica por defecto
            };

            stock.push(nuevoProducto);
            await fs.writeFile(this.path, JSON.stringify(stock, null, 2));
            return { success: true, product: nuevoProducto };
        } catch (error) {
            console.error("❌ Error al agregar producto en el manager:", error);
            return { success: false };
        }
    }
}

export { StockManager as default };