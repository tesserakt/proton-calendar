import { c } from 'ttag';
import { Alert, ConfirmModal } from 'react-components';
import React, { useState } from 'react';
import { RECURRING_TYPES } from '../../../constants';
import SelectRecurringType from './SelectRecurringType';

interface Props {
    types: RECURRING_TYPES[];
    onConfirm: (type: RECURRING_TYPES) => void;
}

const getAlertText = (types: RECURRING_TYPES[]) => {
    if (types.length === 1) {
        if (types[0] === RECURRING_TYPES.SINGLE) {
            return c('Info').t`Would you like to update this event?`;
        }
        if (types[0] === RECURRING_TYPES.ALL) {
            return c('Info').t`Would you like to update all the events in the series?`;
        }
    }
    return c('Info').t`Which event would you like to update?`;
};

const EditRecurringConfirmModal = ({ types, onConfirm, ...rest }: Props) => {
    const [type, setType] = useState(types[0]);

    return (
        <ConfirmModal
            confirm={c('Action').t`Update`}
            title={c('Info').t`Update recurring event`}
            cancel={c('Action').t`Cancel`}
            {...rest}
            onConfirm={() => onConfirm(type)}
        >
            <Alert type="info">{getAlertText(types)}</Alert>
            {types.length > 1 ? (
                <SelectRecurringType
                    types={types}
                    type={type}
                    setType={setType}
                    data-test-id="update-recurring-popover:update-option-radio"
                />
            ) : null}
        </ConfirmModal>
    );
};

export default EditRecurringConfirmModal;