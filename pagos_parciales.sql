-- RPC for Partial Payments (Abonos)
-- This function distributes a general payment amount among all pending credits of a client (FIFO)

CREATE OR REPLACE FUNCTION registrar_abono_general(
    p_cliente_id UUID, 
    p_monto NUMERIC, 
    p_usuario_id UUID
) RETURNS VOID AS $$
DECLARE
    v_monto_restante NUMERIC := p_monto;
    v_credito RECORD;
    v_aplicado NUMERIC;
BEGIN
    -- Validate amount
    IF p_monto <= 0 THEN
        RAISE EXCEPTION 'El monto del abono debe ser mayor a 0';
    END IF;

    -- Iterate through pending credits in chronological order (FIFO)
    FOR v_credito IN 
        SELECT id, saldo_pendiente 
        FROM public.creditos 
        WHERE cliente_id = p_cliente_id AND estado = 'pendiente' 
        ORDER BY fecha_inicio ASC
    LOOP
        -- Stop if we distributed the whole amount
        EXIT WHEN v_monto_restante <= 0;

        IF v_credito.saldo_pendiente <= v_monto_restante THEN
            -- Pay this credit fully
            v_aplicado := v_credito.saldo_pendiente;
            v_monto_restante := v_monto_restante - v_aplicado;
            
            UPDATE public.creditos 
            SET saldo_pendiente = 0, 
                estado = 'pagado' 
            WHERE id = v_credito.id;
        ELSE
            -- Pay this credit partially
            v_aplicado := v_monto_restante;
            v_monto_restante := 0;
            
            UPDATE public.creditos 
            SET saldo_pendiente = saldo_pendiente - v_aplicado 
            WHERE id = v_credito.id;
        END IF;

        -- Record the payment for this specific credit record
        INSERT INTO public.pagos_credito (
            credito_id, 
            usuario_id, 
            monto_pagado, 
            fecha_pago
        ) VALUES (
            v_credito.id, 
            p_usuario_id, 
            v_aplicado, 
            NOW()
        );
    END LOOP;

    -- Optional: If v_monto_restante > 0 after loop, it means client paid more than total debt.
    -- We could handle overpayments here if needed, but for now, we just consume until debt is 0.
END;
$$ LANGUAGE plpgsql;
