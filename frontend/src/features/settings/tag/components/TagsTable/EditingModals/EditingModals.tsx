import { ByteOrderModal } from '@/features/settings/tag/components/ByteOrderModal/ByteOrderModal';
import { DataTypeModal } from '@/features/settings/tag/components/DataTypeModal/DataTypeModal';
import { FunctionCodeModal } from '@/features/settings/tag/components/FunctionCodeModal/FunctionCodeModal';
import type { UseModalsReturn } from '../hooks/useModals';
import type { EditingRow } from '../types';

interface EditingModalsProps {
    editingRow: EditingRow | null;
    modals: UseModalsReturn;
    modalHandlers: {
        byteOrder: {
            close: () => void;
            save: (value: unknown) => void;
        };
        dataType: {
            close: () => void;
            save: (value: unknown) => void;
        };
        functionCode: {
            close: () => void;
            save: (value: unknown) => void;
        };
    };
}

export const EditingModals = ({ editingRow, modals, modalHandlers }: EditingModalsProps) => {
    if (!editingRow) {
        return null;
    }

    return (
        <>
            <ByteOrderModal
                open={modals.isOpen('byteOrder')}
                onClose={modalHandlers.byteOrder.close}
                currentValue={editingRow.data.byteOrder ?? 'ABCD'}
                onSave={modalHandlers.byteOrder.save}
            />
            <DataTypeModal
                open={modals.isOpen('dataType')}
                onClose={modalHandlers.dataType.close}
                currentValue={editingRow.data.dataType ?? 'int16'}
                onSave={modalHandlers.dataType.save}
            />
            <FunctionCodeModal
                open={modals.isOpen('functionCode')}
                onClose={modalHandlers.functionCode.close}
                currentValue={editingRow.data.functionCode ?? 'holding'}
                onSave={modalHandlers.functionCode.save}
            />
        </>
    );
};

