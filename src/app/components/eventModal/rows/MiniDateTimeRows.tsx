import { MAXIMUM_DATE, MINIMUM_DATE } from 'proton-shared/lib/calendar/constants';
import { WeekStartsOn } from 'proton-shared/lib/calendar/interface';
import React from 'react';
import { DateInput, TimeInput } from 'react-components';
import { c } from 'ttag';
import { EventModel } from '../../../interfaces/EventModel';
import { DATE_INPUT_ID } from '../const';
import { getAllDayCheck } from '../eventForm/stateActions';
import useDateTimeFormHandlers from '../hooks/useDateTimeFormHandlers';
import IconRow from '../IconRow';
import AllDayCheckbox from '../inputs/AllDayCheckbox';

interface Props {
    model: EventModel;
    setModel: (value: EventModel) => void;
    displayWeekNumbers: boolean;
    weekStartsOn: WeekStartsOn;
    endError?: string;
}

const MiniDateTimeRows = ({ model, setModel, displayWeekNumbers, weekStartsOn, endError }: Props) => {
    const {
        handleChangeStartDate,
        handleChangeStartTime,
        handleChangeEndDate,
        handleChangeEndTime,
        isDuration,
        minEndTime,
        minEndDate,
    } = useDateTimeFormHandlers({ model, setModel });

    return (
        <IconRow id={DATE_INPUT_ID} icon="clock" title={c('Label').t`Event time`}>
            <div>
                <div className="flex flex-nowrap mb0-5">
                    <DateInput
                        id={DATE_INPUT_ID}
                        className="flex-item-fluid flex-item-grow-2"
                        required
                        value={model.start.date}
                        onChange={handleChangeStartDate}
                        displayWeekNumbers={displayWeekNumbers}
                        weekStartsOn={weekStartsOn}
                        min={MINIMUM_DATE}
                        max={MAXIMUM_DATE}
                        title={c('Title').t`Select event start date`}
                    />
                    {!model.isAllDay && (
                        <TimeInput
                            id="event-startTime"
                            className="ml0-5 flex-item-fluid"
                            value={model.start.time}
                            onChange={handleChangeStartTime}
                            title={c('Title').t`Select event start time`}
                        />
                    )}
                </div>
                <div className="flex flex-nowrap mb0-25">
                    <DateInput
                        id="event-endDate"
                        className="flex-item-fluid flex-item-grow-2"
                        required
                        value={model.end.date}
                        onChange={handleChangeEndDate}
                        aria-invalid={!!endError}
                        displayWeekNumbers={displayWeekNumbers}
                        weekStartsOn={weekStartsOn}
                        min={minEndDate}
                        max={MAXIMUM_DATE}
                        title={c('Title').t`Select event end date`}
                    />
                    {!model.isAllDay && (
                        <TimeInput
                            id="event-endTime"
                            className="ml0-5 flex-item-fluid"
                            value={model.end.time}
                            onChange={handleChangeEndTime}
                            aria-invalid={Boolean(endError)}
                            displayDuration={isDuration}
                            min={minEndTime}
                            title={c('Title').t`Select event end time`}
                        />
                    )}
                </div>
            </div>

            <div>
                <AllDayCheckbox
                    title={
                        model.isAllDay
                            ? c('Title').t`Event is happening on defined time slot`
                            : c('Title').t`Event is happening all day`
                    }
                    checked={model.isAllDay}
                    onChange={(isAllDay) => setModel({ ...model, ...getAllDayCheck(model, isAllDay) })}
                />
            </div>
        </IconRow>
    );
};
export default MiniDateTimeRows;
