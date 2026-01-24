-- FIXED registrar_venta RPC
CREATE OR REPLACE FUNCTION registrar_venta(
    p_cliente_id UUID,
    p_piso_id UUID,
    p_metodo_pago TEXT,
    p_total NUMERIC,
    p_observacion TEXT,
    p_items JSONB
) RETURNS JSONB AS $$
DECLARE
    v_venta_id UUID;
    v_item RECORD;
    v_stock_actual INT;
    v_producto_tipo TEXT;
    v_producto_nombre TEXT;
BEGIN
    -- 1. Insert into ventas
    INSERT INTO public.ventas (
        cliente_id, 
        piso_id, 
        metodo_pago, 
        total, 
        observacion, 
        fecha_venta
    )
    VALUES (
        p_cliente_id, 
        p_piso_id, 
        p_metodo_pago, 
        p_total, 
        p_observacion, 
        NOW()
    )
    RETURNING id INTO v_venta_id;

    -- 2. Process Items
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(id UUID, qty INT, precio NUMERIC)
    LOOP
        -- Get product info
        SELECT nombre, tipo INTO v_producto_nombre, v_producto_tipo 
        FROM public.productos 
        WHERE id = v_item.id;

        -- 3. Only deduct and validate if it is a "stock" product
        IF v_producto_tipo = 'stock' THEN
            -- Update stock and get the new value
            UPDATE public.inventario 
            SET stock = stock - v_item.qty
            WHERE producto_id = v_item.id AND piso_id = p_piso_id
            RETURNING stock INTO v_stock_actual;

            -- Safety check: if the record didn't exist, UPDATE returns nothing
            IF v_stock_actual IS NULL THEN
                 RAISE EXCEPTION 'El producto % no tiene registro de inventario en el piso especificado.', COALESCE(v_producto_nombre, 'desconocido');
            END IF;

            IF v_stock_actual < 0 THEN
                RAISE EXCEPTION 'Stock insuficiente para % en el piso seleccionado.', v_producto_nombre;
            END IF;

            -- Audit log (Optional: only if you have the table)
            -- INSERT INTO public.movimientos_inventario (producto_id, piso_id, tipo, cantidad, observacion, created_at)
            -- VALUES (v_item.id, p_piso_id, 'SALIDA', v_item.qty, 'Venta #' || v_venta_id, NOW());
        END IF;

        -- 4. Note: If you have a details table (ventas_detalle), insert here.
    END LOOP;

    -- 5. Handle Credits (Phase 6)
    IF p_metodo_pago = 'CREDITO' THEN
        INSERT INTO public.creditos (
            cliente_id, 
            monto_total, 
            saldo_pendiente, 
            estado, 
            fecha_inicio, 
            fecha_vencimiento
        ) VALUES (
            p_cliente_id, 
            p_total, 
            p_total, 
            'pendiente', 
            NOW(), 
            NOW() + INTERVAL '30 days'
        );
    END IF;

    RETURN jsonb_build_object('venta_id', v_venta_id);
END;
$$ LANGUAGE plpgsql;
