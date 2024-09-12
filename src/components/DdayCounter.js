import React, { memo, useCallback, useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import moment from 'moment';
import { useFocusEffect } from '@react-navigation/native';
import { SPSvgs } from '../assets/svg';

function DdayCounter({ targetDate, format, onEnd }) {
  const [ddayStr, setDdayStr] = useState();
  const [intervalId, setIntervalId] = useState();
  const [end, setEnd] = useState(false);

  const getDday = () => {
    const now = moment();
    const then = moment(targetDate);
    const duration = moment.duration(then.diff(now));

    let timeLeft = {};

    if (duration > 0) {
      timeLeft = {
        days: Math.floor(duration.asDays()),
        hours: duration.hours(),
        minutes: duration.minutes(),
        seconds: duration.seconds(),
      };
      let str = '';
      const day = timeLeft.days ? `${timeLeft.days}일` : '';
      const hour = timeLeft.hours
        ? String(`${timeLeft.hours}`).padStart(2, '0')
        : '';
      const minute = timeLeft.minutes
        ? String(`${timeLeft.minutes}`).padStart(2, '0')
        : '';
      const second = timeLeft.seconds
        ? String(`${timeLeft.seconds}`).padStart(2, '0')
        : '';
      if (day) str = `${day}`;
      if (hour) str += str ? ` ${hour}` : hour;
      if (minute) str += str ? `:${minute}` : minute;
      if (second) str += str ? `:${second}` : second;
      setDdayStr(`${str}`);
    } else {
      setDdayStr('');
      setEnd(true);
      if (onEnd) onEnd();
    }
  };

  useFocusEffect(
    useCallback(() => {
      setEnd(false);
      const id = setInterval(getDday, 500);
      setIntervalId(id);
      return () => clearInterval(id);
    }, []),
  );

  useEffect(() => {
    if (end && intervalId) clearInterval(intervalId);
  }, [end, intervalId]);

  return (
    ddayStr && (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 4,
        }}>
        <SPSvgs.Time />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: 400,
              color: '#1A1C1E',
              lineHeight: 20,
              letterSpacing: 0.203,
            }}>
            마감까지
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: '#002672',
              lineHeight: 24,
              letterSpacing: 0.091,
            }}>
            {ddayStr}
          </Text>
        </View>
      </View>
    )
  );
}

export default memo(DdayCounter);
