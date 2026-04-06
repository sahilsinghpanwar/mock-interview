import React from 'react'
import { Controller } from 'react-hook-form'
import { Field, FieldDescription, FieldError, FieldLabel } from './ui/field'
import { Input } from './ui/input'

const FormController = () => (
     <Controller>
                  name="username"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="form-rhf-input-username">
                        Username
                      </FieldLabel>
                       <Input
                        {...field}
                        id="form-rhf-input-username"
                        aria-invalid={fieldState.invalid}
                        placeholder="username"
                        autoComplete="username"
                      />
    
    
                      <FieldLabel htmlFor="form-rhf-input-username">
                        Email
                      </FieldLabel>
                      <Input
                        {...field}
                        id="form-rhf-input-email"
                        aria-invalid={fieldState.invalid}
                        placeholder="email"
                        autoComplete="email"
                      />
    
    
                      <FieldLabel htmlFor="form-rhf-input-username">
                        Password
                      </FieldLabel>
                      <Input
                        {...field}
                        id="form-rhf-input-password"
                        aria-invalid={fieldState.invalid}
                        placeholder="password"
                        autoComplete="password"
                      />
                     
                      <FieldDescription>
                        This is your public display name. Must be between 3 and 10
                        characters. Must only contain letters, numbers, and
                        underscores.
                      </FieldDescription>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
               </Controller>
                )

export default FormController;
