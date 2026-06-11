import fs from 'fs/promises';   
import path from 'path';

class StockManager {
    constructor(path) {
        this.path = path;
    }

    async getStock() {
        try {
            const data = await fs.readFile(this.path, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            return []; 
        }
    }

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

    async addProduct(product) {
        const stock = await this.getStock();
        product.id = stock.length > 0 ? stock[stock.length - 1].id + 1 : 1;
        stock.push(product);
        await fs.writeFile(this.path, JSON.stringify(stock, null, 2));
        return product;
    }

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

    async checkAlertas(limite) {
        const stock = await this.getStock();
        return stock.filter(p => p.stockKilos <= limite);
    }

    async getBalance() {
        try {
            const stock = await this.getStock();
            
            const totalKilos = stock.reduce((acc, p) => acc + (Number(p.stockKilos) || 0), 0);
            
            const valorPesos = stock.reduce((acc, p) => {
                let precioCrudo = p.precio || p.precioKilo || 0;
                
                if (typeof precioCrudo === 'string') {
                    precioCrudo = precioCrudo.replace(/[^0-9]/g, ''); 
                }
                
                const precioActual = Number(precioCrudo) || 0;
                const kilosActuales = Number(p.stockKilos || 0);
                
                return acc + (precioActual * kilosActuales);
            }, 0);

            return {
                total_kilos_en_camara: totalKilos.toFixed(2),
                valor_total_inventario: valorPesos, 
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

    async deleteProduct(id) {
        try {
            const stock = await this.getStock();
            
            const existe = stock.some(p => p.id === id);
            
            if (!existe) {
                return { success: false, message: "No se encontró el corte para eliminar" };
            }

            const nuevoStock = stock.filter(p => p.id !== id);
            
            await fs.writeFile(this.path, JSON.stringify(nuevoStock, null, 2));
            return { success: true };
        } catch (error) {
            console.error("❌ Error al eliminar producto en el manager:", error);
            return { success: false, message: "Error interno al escribir el archivo" };
        }
    }

    async addProduct(productData) {
        try {
            const stock = await this.getStock();
            
            const nuevoId = stock.length > 0 ? Math.max(...stock.map(p => p.id)) + 1 : 1;
            
            const nuevoProducto = {
                id: nuevoId,
                title: productData.title,
                price: Number(productData.price) || 0,
                stockKilos: Number(productData.stockKilos) || 0,
                category: productData.category || "Varios",
                img: productData.img || "https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=500" 
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