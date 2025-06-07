-- Verificar si la tabla conductores existe
DO $$
BEGIN
    -- Verificar si la tabla existe
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'conductores') THEN
        -- Verificar si las columnas ya existen
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'conductores' AND column_name = 'archivo_url') THEN
            -- Agregar las columnas faltantes
            ALTER TABLE conductores 
            ADD COLUMN archivo_url TEXT,
            ADD COLUMN tipo_archivo VARCHAR(50) DEFAULT 'documento';
            
            RAISE NOTICE 'Se agregaron las columnas archivo_url y tipo_archivo a la tabla conductores';
        ELSE
            RAISE NOTICE 'Las columnas ya existen en la tabla conductores';
        END IF;
    ELSE
        -- Si la tabla no existe, crearla
        CREATE TABLE conductores (
            id SERIAL PRIMARY KEY,
            nombre VARCHAR(100) NOT NULL,
            apellido VARCHAR(100),
            email VARCHAR(100) UNIQUE NOT NULL,
            telefono VARCHAR(20),
            licencia VARCHAR(50) UNIQUE NOT NULL,
            estado VARCHAR(20) DEFAULT 'disponible',
            archivo_url TEXT,
            tipo_archivo VARCHAR(50) DEFAULT 'documento',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Crear índices
        CREATE INDEX idx_conductores_estado ON conductores(estado);
        CREATE INDEX idx_conductores_licencia ON conductores(licencia);
        
        RAISE NOTICE 'Se creó la tabla conductores con las columnas necesarias';
    END IF;
END $$;
