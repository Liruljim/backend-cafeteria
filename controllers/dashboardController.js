const supabase = require('../config/supabaseClient');

const getMetrics = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 1. Sales Today
        const { data: salesToday, error: salesErr } = await supabase
            .from('ventas')
            .select('total')
            .gte('fecha_venta', today.toISOString());
        
        if (salesErr) throw salesErr;
        const totalSales = salesToday.reduce((acc, v) => acc + parseFloat(v.total), 0);

        // 2. Credits Today
        const { data: creditsToday, error: credErr } = await supabase
            .from('ventas')
            .select('total')
            .eq('metodo_pago', 'CREDITO')
            .gte('fecha_venta', today.toISOString());
        
        if (credErr) throw credErr;
        const totalCredits = creditsToday.reduce((acc, v) => acc + parseFloat(v.total), 0);
        const creditCount = creditsToday.length;

        // 3. Pending Payments (Clients with balance)
        const { data: pendingData, error: pendErr } = await supabase
            .rpc('get_clientes_con_saldo');
        
        if (pendErr) throw pendErr;
        const pendingClientsCount = pendingData ? pendingData.length : 0;

        // 4. Low Stock Products (< 10)
        // Only for 'stock' type products
        const { data: lowStock, error: stockErr } = await supabase
            .from('inventario')
            .select('stock, productos!inner(tipo)')
            .eq('productos.tipo', 'stock')
            .lt('stock', 10);
            
        if (stockErr) throw stockErr;
        const lowStockCount = lowStock.length;

        // 5. Recent Activity (Mix of sales and movements)
        const { data: recentSales, error: recSalesErr } = await supabase
            .from('ventas')
            .select('total, metodo_pago, fecha_venta, clientes(nombre)')
            .order('fecha_venta', { ascending: false })
            .limit(5);

        res.json({
            today: {
                sales: totalSales,
                credits: totalCredits,
                creditCount: creditCount
            },
            pendingClients: pendingClientsCount,
            lowStock: lowStockCount,
            recentActivity: recentSales || []
        });

    } catch (error) {
        console.error('Dashboard Error:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getMetrics };
