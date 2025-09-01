import React, { useState } from 'react'
import { useSprings, animated, to as interpolate } from '@react-spring/web';
import { useDrag } from 'react-use-gesture';
import styles from './styles.module.css';
import styled from "styled-components";

const cards = [
  'https://i.imgur.com/WYa1sHs.png',
  'https://i.imgur.com/lTAFZXr.png',
  'https://i.imgur.com/4k59YXf.png',
  'https://i.imgur.com/YZCEWT2.png',
  'https://i.imgur.com/ckQvFC4.png',
  'https://i.imgur.com/HuUy5S5.png',
]

// These two are just helpers, they curate spring data, values that are later being interpolated into css
const to = (i: number) => ({
  x: 0,
  y: i * -4,
  scale: 1,
  rot: -10 + Math.random() * 20,
  delay: i * 100,
})
const from = (_i: number) => ({ x: 0, rot: 0, scale: 1.5, y: -1000 })
// This is being used down there in the view, it interpolates rotation and scale into a css transform
const trans = (r: number, s: number) =>
  `perspective(1500px) rotateX(30deg) rotateY(${r / 10}deg) rotateZ(${r}deg) scale(${s})`

function Deck() {
  const [gone] = useState(() => new Set()) // The set flags all the cards that are flicked out
  const [props, api] = useSprings(cards.length, i => ({
    ...to(i),
    from: from(i),
  })) // Create a bunch of springs using the helpers above
  // Create a gesture, we're interested in down-state, delta (current-pos - click-pos), direction and velocity
  const bind = useDrag(({ args: [index], down, movement: [mx], direction: [xDir], velocity }) => {
    const trigger = velocity > 0.2 // If you flick hard enough it should trigger the card to fly out
    const dir = xDir < 0 ? -1 : 1 // Direction should either point left or right
    if (!down && trigger) gone.add(index) // If button/finger's up and trigger velocity is reached, we flag the card ready to fly out
    api.start(i => {
      if (index !== i) return // We're only interested in changing spring-data for the current spring
      const isGone = gone.has(index)
      const x = isGone ? (200 + window.innerWidth) * dir : down ? mx : 0 // When a card is gone it flys out left or right, otherwise goes back to zero
      const rot = mx / 100 + (isGone ? dir * 10 * velocity : 0) // How much the card tilts, flicking it harder makes it rotate faster
      const scale = down ? 1.1 : 1 // Active cards lift up a bit
      return {
        x,
        rot,
        scale,
        delay: undefined,
        config: { friction: 50, tension: down ? 800 : isGone ? 200 : 500 },
      }
    })
    if (!down && gone.size === cards.length)
      setTimeout(() => {
        gone.clear()
        api.start(i => to(i))
      }, 600)
  })
  // Now we're just mapping the animated values to our view, that's it. Btw, this component only renders once. :-)
  return (
    <>
      {props.map(({ x, y, rot, scale }, i) => (
        <animated.div className={styles.deck} key={i} style={{ x, y }}>
          {/* This is the card itself, we're binding our gesture to it (and inject its index so we know which is which) */}
          <animated.div
            {...bind(i)}
            style={{
              transform: interpolate([rot, scale], trans),
              backgroundImage: `url(${cards[i]},)`,
            }}
          />
        </animated.div>
      ))}
    </>
    
  )
}

const theme = {
  blue: {
    default: "rgb(97, 145, 171)",
    hover: "rgb(54, 139, 185)",
  },
  
};

const Button = styled.button`
  background-color: ${(props) => theme[props.theme].default};
  color: white;
  padding: 5px 15px;
  border-radius: 5px;
  outline: 0;
  border: 0; 
  text-transform: uppercase;
  margin: 0;
  width: 33.33%;
  height: 4vh;
  cursor: pointer;
  box-shadow: 0px 2px 2px rgb(126,143,153);
  transition: ease background-color 250ms;
  &:hover {
    background-color: ${(props) => theme[props.theme].hover};
  }
  &:disabled {
    cursor: default;
    opacity: 0.7;
  }
`;

Button.defaultProps = {
  theme: "blue",
};





export default function App() {
  return (
    <>
    <div className={styles.container}>
      <Deck />
    </div>
    <div>
    <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank">
        <Button>¡Confirma!</Button>
      </a>
      <a href="https://www.youtube.com/watch?v=y6120QOlsfU" target="_blank">
        <Button>Lista novios</Button>
      </a>
      <a href="https://www.youtube.com/watch?v=mOYZaiDZ7BM" target="_blank">
        <Button>¡Inspirate!</Button>
      </a>
      </div>
    </>
  )
}
