import { VcalDateOrDateTimeProperty, VcalRruleProperty } from 'proton-shared/lib/interfaces/calendar/VcalModel';
import { getPropertyTzid, isIcalPropertyAllDay } from 'proton-shared/lib/calendar/vcalConverter';
import { getUntilProperty } from '../../../components/eventModal/eventForm/modelToFrequencyProperties';

export const withRruleUntil = (rrule: VcalRruleProperty, dtstart: VcalDateOrDateTimeProperty): VcalRruleProperty => {
    const until = rrule.value?.until;
    if (!until) {
        return rrule;
    }
    return {
        ...rrule,
        value: {
            ...rrule.value,
            until: getUntilProperty(until, isIcalPropertyAllDay(dtstart), getPropertyTzid(dtstart)),
        },
    };
};
