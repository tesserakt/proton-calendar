import { splitExtension } from 'proton-shared/lib/helpers/file';
import { noop } from 'proton-shared/lib/helpers/function';
import { Calendar } from 'proton-shared/lib/interfaces/calendar';
import React, { ChangeEvent, useState } from 'react';
import { FormModal, PrimaryButton, useEventManager } from 'react-components';
import { c } from 'ttag';

import { MAX_IMPORT_FILE_SIZE } from '../../constants';
import { getSupportedEvents, parseIcs, splitErrors } from '../../helpers/import';
import { IMPORT_STEPS, ImportCalendarModel } from '../../interfaces/Import';

import AttachingModalContent from './AttachingModalContent';
import ImportingModalContent from './ImportingModalContent';
import ImportSummaryModalContent from './ImportSummaryModalContent';
import WarningModalContent from './WarningModalContent';
import { IMPORT_ERROR_TYPE, ImportFileError } from './ImportFileError';

interface Props {
    defaultCalendar: Calendar;
    calendars: Calendar[];
    onClose?: () => void;
}
const ImportModal = ({ calendars, defaultCalendar, ...rest }: Props) => {
    const { call } = useEventManager();
    const [model, setModel] = useState<ImportCalendarModel>({
        step: IMPORT_STEPS.ATTACHING,
        calendar: defaultCalendar,
        eventsParsed: [],
        totalEncrypted: 0,
        totalImported: 0,
        errors: [],
        loading: false,
    });

    const { content, ...modalProps } = (() => {
        if (model.step <= IMPORT_STEPS.ATTACHED) {
            const submit = (
                <PrimaryButton disabled={model.step === IMPORT_STEPS.ATTACHING} loading={model.loading} type="submit">
                    {c('Action').t`Import`}
                </PrimaryButton>
            );

            const handleClear = () => {
                setModel({
                    step: IMPORT_STEPS.ATTACHING,
                    calendar: model.calendar,
                    eventsParsed: [],
                    totalEncrypted: 0,
                    totalImported: 0,
                    errors: [],
                    loading: false,
                });
            };

            const handleAttach = ({ target }: ChangeEvent<HTMLInputElement>) => {
                try {
                    if (!target.files) {
                        throw new ImportFileError(IMPORT_ERROR_TYPE.NO_FILE_SELECTED);
                    }
                    const [file] = target.files;
                    const filename = file.name;
                    const [, extension] = splitExtension(filename);
                    const fileAttached = extension.toLowerCase() === 'ics' ? file : null;
                    if (!fileAttached) {
                        throw new ImportFileError(IMPORT_ERROR_TYPE.NO_ICS_FILE, filename);
                    }
                    if (fileAttached.size > MAX_IMPORT_FILE_SIZE) {
                        throw new ImportFileError(IMPORT_ERROR_TYPE.FILE_TOO_BIG, filename);
                    }
                    setModel({ ...model, step: IMPORT_STEPS.ATTACHED, fileAttached, failure: undefined });
                } catch (e) {
                    setModel({ ...model, failure: e });
                }
            };

            const handleSelectCalendar = (calendar: Calendar) => {
                setModel({ ...model, calendar });
            };

            const handleSubmit = async () => {
                const { fileAttached } = model;
                if (!fileAttached) {
                    throw new Error('No file');
                }
                try {
                    setModel({ ...model, loading: true });
                    const { components, calscale, xWrTimezone } = await parseIcs(fileAttached);
                    const { errors, rest: parsed } = splitErrors(
                        getSupportedEvents({ components, calscale, xWrTimezone })
                    );
                    if (!parsed.length && !errors.length) {
                        throw new ImportFileError(IMPORT_ERROR_TYPE.NO_EVENTS, fileAttached.name);
                    }
                    const step = errors.length || !parsed.length ? IMPORT_STEPS.WARNING : IMPORT_STEPS.IMPORTING;
                    setModel({
                        ...model,
                        step,
                        eventsParsed: parsed,
                        errors,
                        failure: undefined,
                        loading: false,
                    });
                } catch (e) {
                    setModel({
                        step: IMPORT_STEPS.ATTACHING,
                        calendar: model.calendar,
                        eventsParsed: [],
                        totalEncrypted: 0,
                        totalImported: 0,
                        errors: [],
                        failure: e,
                        loading: false,
                    });
                }
            };

            return {
                content: (
                    <AttachingModalContent
                        model={model}
                        calendars={calendars}
                        onSelectCalendar={handleSelectCalendar}
                        onAttach={handleAttach}
                        onClear={handleClear}
                    />
                ),
                submit,
                onSubmit: handleSubmit,
            };
        }

        if (model.step <= IMPORT_STEPS.WARNING) {
            const submit = (
                <PrimaryButton disabled={!model.eventsParsed?.length} type="submit">
                    {c('Action').t`Import`}
                </PrimaryButton>
            );

            const handleSubmit = () => {
                setModel({ ...model, step: IMPORT_STEPS.IMPORTING, errors: [] });
            };

            return {
                title: c('Title').t`Warning`,
                content: <WarningModalContent model={model} />,
                submit,
                onSubmit: handleSubmit,
            };
        }

        if (model.step === IMPORT_STEPS.IMPORTING) {
            const submit = (
                <PrimaryButton disabled type="submit">
                    {c('Action').t`Continue`}
                </PrimaryButton>
            );

            const handleFinish = async () => {
                setModel((model) => ({ ...model, step: IMPORT_STEPS.FINISHED }));
                await call();
            };

            return {
                content: <ImportingModalContent model={model} setModel={setModel} onFinish={handleFinish} />,
                submit,
                onSubmit: noop,
            };
        }
        // model.step === IMPORT_STEPS.FINISHED at this stage
        const submit = <PrimaryButton type="submit">{c('Action').t`Close`}</PrimaryButton>;

        return {
            content: <ImportSummaryModalContent model={model} />,
            submit,
            close: null,
            onSubmit: rest.onClose,
        };
    })();

    return (
        <FormModal title={c('Title').t`Import events`} {...modalProps} {...rest}>
            {content}
        </FormModal>
    );
};

export default ImportModal;
