import React, { useState, useEffect, useCallback } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';

import { addDays, addSeconds, setHours, setMinutes } from 'date-fns';
import * as locales from 'date-fns/locale';

import { FormModelConfig } from '@context';
import { UITypes, FormModelUI } from '@constants';
import { getLocale } from '@utils';

import 'react-datepicker/dist/react-datepicker.css';

import { ErrorMessage } from './date-time.styles';

const DateTimePicker = React.memo(
  ({ id, value, modifyFormObject, formObject, onSave, autoSave, onBlur, ...rest }) => {
    const [selectedDate, setDate] = useState(null);
    const [invalidate, setInvalid] = useState(null);

    const {
      UI_LABEL,
      RDF_TYPE,
      MIN_VALUE,
      MAX_VALUE,
      MIN_DATE_OFFSET,
      MAX_DATE_OFFSET,
      MIN_DATETIME_OFFSET,
      MAX_DATETIME_OFFSET
    } = FormModelUI;

    const minValue = rest[MIN_VALUE];
    const maxValue = rest[MAX_VALUE];
    const mindateOffset = parseInt(rest[MIN_DATE_OFFSET], 10);
    const maxdateOffset = parseInt(rest[MAX_DATE_OFFSET], 10);
    const mindatetimeOffset = parseInt(rest[MIN_DATETIME_OFFSET], 10);
    const maxdatetimeOffset = parseInt(rest[MAX_DATETIME_OFFSET], 10);
    const label = rest[UI_LABEL] || '';
    const type = rest[RDF_TYPE];

    const updateDate = useCallback(() => {
      const actualValue = formObject[id] || formObject[id] === '' ? formObject[id].value : value;

      if (actualValue) {
        setDate(new Date(actualValue));
      }
    }, [formObject]);

    const onChange = useCallback(date => {
      let obj = {};

      /* User wants to remove the date */
      if (!date) obj = { value: '', ...rest };
      else obj = { value: date.toUTCString(), ...rest };

      modifyFormObject(id, obj);
      setDate(date);
    });

    useEffect(() => {
      updateDate();
    }, [value, formObject]);

    /* set the date ranges based on the UI Element to display */
    let minDate;
    let maxDate;
    let minTime;
    let maxTime;
    let dateOptions;

    /* Transform the incoming values depending on the type of element to display */
    if (type === UITypes.TimeField) {
      /* min, max Values are times */
      const [minHours, minMinutes] = minValue.split(':');
      const [maxHours, maxMinutes] = maxValue.split(':');

      minTime = setHours(setMinutes(new Date(), minMinutes), minHours);
      maxTime = setHours(setMinutes(new Date(), maxMinutes), maxHours);

      dateOptions = { minTime, maxTime, dateFormat: 'p', showTimeSelectOnly: true };
    }
    if (type === UITypes.DateTimeField) {
      /* min, max Values are datetimes and offset is in seconds */

      if (!Number.isNaN(mindatetimeOffset)) minDate = addSeconds(new Date(), mindatetimeOffset);

      if (!Number.isNaN(maxdatetimeOffset)) maxDate = addSeconds(new Date(), maxdatetimeOffset);

      /* min,maxValue take priority over the offsets if both values are provided */
      if (minValue) minDate = new Date(minValue);
      if (maxValue) maxDate = new Date(maxValue);

      dateOptions = { minDate, maxDate, dateFormat: 'Pp', showTimeSelect: true };
    }
    if (type === UITypes.DateField) {
      /* min,maxValue are dates and offset is in days */

      if (!Number.isNaN(mindateOffset)) minDate = addDays(new Date(), mindateOffset);
      if (!Number.isNaN(maxdateOffset)) maxDate = addDays(new Date(), maxdateOffset);

      /* min,maxValue take priority over the offsets if both values are provided */
      if (minValue) minDate = new Date(minValue);
      if (maxValue) maxDate = new Date(maxValue);

      dateOptions = { minDate, maxDate, dateFormat: 'P' };
    }

    /* transform the browser  locale code to match the date-fns format */
    let locale = getLocale().split('-');
    if (locale[2]) {
      locale[2] = locale[2].toUpperCase();
      locale = `${locale[0]}${locale[2]}`;
    } else {
      locale = `${locale[0]}`;
    }

    registerLocale(locale, locales[locale]);

    return (
      <FormModelConfig.Consumer>
        {({ theme }) => (
          <div>
            <label htmlFor={id}>{label}</label>
            <DatePicker
              {...{
                id,
                ...dateOptions,
                selected: selectedDate,
                onChange,
                className: theme && theme.inputText,
                onBlur,
                locale
              }}
            />
            {invalidate && <ErrorMessage>{invalidate}</ErrorMessage>}
          </div>
        )}
      </FormModelConfig.Consumer>
    );
  }
);

export default DateTimePicker;
