import React from 'react';
import { Button } from 'react-native';
import InvalidUserException from '../../common/exceptions/InvalidUserException';
import { handleError } from '../../utils/HandleError';
import {
  AccessDeniedException,
  CustomException,
  NetworkException,
} from '../../common/exceptions';

export default function ExceptionTest() {
  return (
    <>
      <Button
        title="InvalidUserException"
        onPress={() => {
          try {
            throw new InvalidUserException('InvalidUserException');
          } catch (error) {
            handleError(error);
          }
        }}
      />
      <Button
        title="AccessDeniedException"
        onPress={() => {
          try {
            throw new AccessDeniedException('AccessDeniedException');
          } catch (error) {
            handleError(error);
          }
        }}
      />
      <Button
        title="CustomException"
        onPress={() => {
          try {
            throw new CustomException('CustomException');
          } catch (error) {
            handleError(error);
          }
        }}
      />
      <Button
        title="NetworkException"
        onPress={() => {
          try {
            throw new NetworkException('NetworkException');
          } catch (error) {
            handleError(error);
          }
        }}
      />
    </>
  );
}
