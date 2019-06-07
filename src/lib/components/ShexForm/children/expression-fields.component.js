import React, { Fragment } from 'react';
import { shexUtil } from '@utils';
import { AddButton, Field } from '.';

type FieldsProps = {
  data: Object,
  formValues: Object,
  parent: Object
};

const ExpressionFields = ({ data, formValues, parent }: FieldsProps) => {
  return (
    <Fragment>
      <ul>
        {data._formValues &&
          data._formValues.map(value => (
            <li key={value}>
              <Field
                {...{
                  data,
                  fieldData: value,
                  inputData:
                    (formValues && formValues[value._formFocus.name]) ||
                    value._formFocus,
                  parent,
                  canDelete: shexUtil.canDelete(data)
                }}
              />
            </li>
          ))}
      </ul>
      <AddButton
        {...{
          allowNewFields: shexUtil.allowNewFields(data) && !parent,
          defaultExpression: data,
          expression: parent
        }}
      />
    </Fragment>
  );
};

export default ExpressionFields;
