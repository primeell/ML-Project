import { useEffect, useRef } from 'react'
import Matter from 'matter-js'
import './App.css'

function App() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<Matter.Engine | null>(null)
  const birdRef = useRef<Matter.Body | null>(null)
  const slingshotRef = useRef<Matter.Constraint | null>(null)

  useEffect(() => {
    const Engine = Matter.Engine
    const Render = Matter.Render
    const World = Matter.World
    const Bodies = Matter.Bodies
    const Constraint = Matter.Constraint
    const Mouse = Matter.Mouse
    const MouseConstraint = Matter.MouseConstraint

    // create engine
    const engine = Engine.create()
    engineRef.current = engine

    // create renderer
    const render = Render.create({
      element: canvasRef.current!,
      engine: engine,
      options: {
        width: 800,
        height: 600,
        wireframes: false,
        background: '#87CEEB'
      }
    })

    // create slingshot structure
    const leftPole = Bodies.rectangle(150, 450, 20, 120, {
      isStatic: true,
      render: { fillStyle: '#8B4513' }
    })

    const rightPole = Bodies.rectangle(180, 450, 20, 120, {
      isStatic: true,
      render: { fillStyle: '#8B4513' }
    })

    const base = Bodies.rectangle(165, 520, 80, 20, {
      isStatic: true,
      render: { fillStyle: '#8B4513' }
    })

    // create bird with improved properties
    const bird = Bodies.circle(200, 500, 20, {
      render: { fillStyle: '#e51e1e' },
      restitution: 0.8,
      density: 0.004,
      friction: 0.005,
      collisionFilter: {
        group: -1
      }
    })
    birdRef.current = bird

    // create improved slingshot constraint
    const slingshot = Constraint.create({
      pointA: { x: 165, y: 450 },
      bodyB: bird,
      stiffness: 0.01,
      damping: 0.01,
      length: 40,
      render: {
        visible: true,
        lineWidth: 3,
        strokeStyle: '#432109'
      }
    })
    slingshotRef.current = slingshot

    // create ground
    const ground = Bodies.rectangle(400, 590, 800, 20, {
      isStatic: true,
      render: { fillStyle: '#2c2c2c' }
    })

    // add improved mouse control
    const mouse = Mouse.create(render.canvas)
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.02,
        render: { visible: false }
      },
      collisionFilter: {
        mask: 0x0001
      }
    })

    // Box properties
    const boxProps = {
      density: 0.001,    // Medium density
      restitution: 0.2,  // Low bounce
      friction: 0.5,     // Medium friction
      render: { 
        fillStyle: '#8B4513',
        strokeStyle: '#654321',
        lineWidth: 2
      }
    }

    // Create pyramid boxes
    const boxes = [
      // Bottom row (5 boxes)
      Bodies.rectangle(400, 550, 50, 50, boxProps),
      Bodies.rectangle(450, 550, 50, 50, boxProps),
      Bodies.rectangle(500, 550, 50, 50, boxProps),
      Bodies.rectangle(550, 550, 50, 50, boxProps),
      Bodies.rectangle(600, 550, 50, 50, boxProps),
      
      // Second row (4 boxes)
      Bodies.rectangle(425, 500, 50, 50, boxProps),
      Bodies.rectangle(475, 500, 50, 50, boxProps),
      Bodies.rectangle(525, 500, 50, 50, boxProps),
      Bodies.rectangle(575, 500, 50, 50, boxProps),
      
      // Third row (3 boxes)
      Bodies.rectangle(450, 450, 50, 50, boxProps),
      Bodies.rectangle(500, 450, 50, 50, boxProps),
      Bodies.rectangle(550, 450, 50, 50, boxProps),
      
      // Fourth row (2 boxes)
      Bodies.rectangle(475, 400, 50, 50, boxProps),
      Bodies.rectangle(525, 400, 50, 50, boxProps),
      
      // Top box
      Bodies.rectangle(500, 350, 50, 50, boxProps)
    ]

    // Create pig at the top
    const pig = Bodies.circle(500, 325, 20, {
      density: 0.0005,      // Light weight
      restitution: 0.6,     // High bounce
      friction: 0.3,        // Medium-low friction
      render: {
        fillStyle: '#4CAF50',
        strokeStyle: '#388E3C',
        lineWidth: 2
      }
    })

    // Add all bodies to world
    World.add(engine.world, [
      ground,
      leftPole,
      rightPole,
      base,
      bird,
      slingshot,
      mouseConstraint,
      ...boxes,  // Spread operator untuk menambahkan semua box
      pig
    ])

    // improved mouse events
    Matter.Events.on(mouseConstraint, 'mousedown', function(event) {
      const mousePosition = event.mouse.position
      const distance = Matter.Vector.magnitude(
        Matter.Vector.sub(mousePosition, bird.position)
      )
      if (distance > 20) {
        mouseConstraint.constraint.bodyB = bird
      }
    })

    Matter.Events.on(mouseConstraint, 'mousemove', function(event) {
      if (bird.position.x > 165) {
        Matter.Body.setPosition(bird, {
          x: 165,
          y: bird.position.y
        })
      }
    })

    Matter.Events.on(mouseConstraint, 'mouseup', function() {
      if (bird.position.x < 165) {
        setTimeout(() => {
          slingshot.bodyB = null
          Matter.Body.setVelocity(bird, {
            x: (165 - bird.position.x) * 0.05,
            y: (450 - bird.position.y) * 0.05
          })
        }, 50)
      }
    })

    // run engine and renderer
    Engine.run(engine)
    Render.run(render)

    // cleanup
    return () => {
      Render.stop(render)
      World.clear(engine.world, false)
      Engine.clear(engine)
      render.canvas.remove()
    }
  }, [])

  return (
    <div 
      ref={canvasRef} 
      style={{ 
        width: '800px', 
        height: '600px',
        margin: 'auto',
        marginTop: '20px'
      }}
    />
  )
}

export default App
