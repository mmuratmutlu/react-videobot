import { useEffect, useRef, useState } from 'react'
import React from 'react'
import styles from './videoBot.module.css'

interface IOption {
  label: string
  value: IVideoNode | AIForm | AIRedirect
  customHTML?: (item: IOption) => Element
}

/***Action İnterfaces */
interface AIForm {
  formName: string
}
interface AIRedirect {
  redirectUrl: string
}
interface AIOptions {
  options: IOption[]
}
/** */

interface IVideoNode {
  _id: number
  src: string
  action: AIOptions | AIForm | AIRedirect //Multiple Interface
}

interface Props {
  miniVideoSrc: string
  onSelect: (
    selected: IVideoNode | AIForm | AIRedirect,
    onChangeVideo: (src: string) => void
  ) => void
  videoNode: IVideoNode
}

export const VideoBot: React.FC<Props> = ({
  miniVideoSrc,
  onSelect,
  videoNode
}: Props) => {
  //==>States
  const [moduleIsEnable, setModuleIsEnable] = useState(true)
  const [enable, setEnable] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [onCanPlay, setOnCanPlay] = useState(false)
  const [renderActions, setRenderActions] = useState<
    AIOptions | [] | AIForm | AIRedirect
  >([])
  //<==
  //==>Refs
  const _mainVideo = useRef<HTMLVideoElement>(null)
  const _wrapper = useRef<HTMLDivElement>(null)
  //<==
  //==>Hook Events
  useEffect(() => {
    if (window.innerWidth < 800) {
      setIsMobile(true)
    }
    document.addEventListener('fullscreenchange', fullScreenExitHandler, false) // FullScreen Detection
  }, [])
  ////////////////////
  useEffect(() => {
    changeVideo(videoNode.src)
  }, [videoNode])
  //<====
  function changeVideo(url: string) {
    setOnCanPlay(false)
    setRenderActions([]) // for remove previous action elements e.g buttons
    if (_mainVideo.current) {
      _mainVideo.current.src = url
      _mainVideo.current.load()
      _mainVideo.current.play()
    }
  }
  function fullScreenExitHandler() {
    if (document.fullscreenElement == null) {
      //if leave fullscreen
      disableVideo()
    }
  }

  function enableVideo() {
    if (!enable) {
      setEnable(true)
      setTimeout(() => {
        if (_mainVideo.current) {
          changeVideo(videoNode.src)
        }
        if (isMobile) {
          _wrapper.current?.requestFullscreen()
        }
      }, 200)
    }
  }

  function disableVideo() {
    setEnable(false) // remove video container
    setRenderActions([]) // remove interactive element
    if (isMobile && document.fullscreenElement) {
      //İF FullScreen and mobile
      document.exitFullscreen()
    }
  }
  function disableModule() {
    setModuleIsEnable(false) //This function is removes module in Html completely
  }

  //Control Functions ==>
  function isIVideoNode(obj: any): obj is IVideoNode {
    if (obj) {
      return obj.src !== undefined
    } else {
      return false
    }
  }
  function isAIOptions(obj: any): obj is AIOptions {
    if (obj && obj.options) {
      return obj.options[0].label !== undefined
    } else {
      console.log('false')
      return false
    }
  }
  function isAIForm(obj: any): obj is AIForm {
    return obj.formName !== undefined
  }
  function isAIRedirect(obj: any): obj is AIRedirect {
    return obj.redirectUrl !== undefined
  }
  //<==

  function _renderOnEndedItem() {
    if (renderActions) {
      if (isAIOptions(renderActions)) {
        return (
          //Type Constrol And Rendering
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              marginBottom: '25px'
            }}
          >
            {(renderActions as AIOptions).options.map(
              (item: IOption, index: number) => _renderOptionItem(item, index)
            )}
          </div>
        )
      } else if (isAIForm(renderActions)) {
        return (
          <div
            style={{
              width: '100%',
              height: '200px',
              backgroundColor: 'white'
            }}
          ></div>
        )
      }
    }
  }
  function _renderOptionItem(item: IOption, index: number) {
    return (
      <div
        onClick={() => {
          //onSelect
          if (item.value) {
            if (isAIForm(item.value)) {
              setRenderActions(item.value)
            } else if (isAIRedirect(item.value)) {
              window.location.href = item.value.redirectUrl
            } else if (isIVideoNode(item.value)) {
              onSelect(item.value, (src) => {
                changeVideo(src)
              })
            }
          }
        }}
        className={[styles.fadeInUp, styles['animated-' + (index + 1)]].join(
          ' '
        )}
        key={index}
      >
        {(item.customHTML && item.customHTML(item)) || (
          <div className={styles.interactiveButton}>
            <span>{item.label}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {moduleIsEnable && (
        <div
          onClick={() => {
            enableVideo()
          }}
          className={
            enable
              ? [styles.wrapper, styles.area, styles.playAnimation].join(' ')
              : [styles.wrapper, styles.area].join(' ')
          }
        >
          {
            !enable ? (
              /**********MİNİ VİDEO*/
              <div
                className={styles.miniVideoWrapper}
                style={{ display: 'flex', width: '100%' }}
              >
                <video
                  id="minivideo"
                  className={styles.borderVideo}
                  onTimeUpdate={() => {
                    //console.log('devam', item.currentTarget.currentTime)
                  }}
                  loop
                  autoPlay
                  muted
                >
                  <source src={miniVideoSrc} type="video/mp4" />
                </video>
                <div
                  className={[
                    styles.mini_videoTopNav,
                    styles.blackGradient
                  ].join(' ')}
                >
                  <div className={styles.mini_buttonBackground}>
                    <button
                      style={{
                        width: '10px',
                        height: '2px'
                      }}
                      onClick={() => {
                        disableModule()
                      }}
                    ></button>
                  </div>
                </div>
              </div>
            ) : (
              /*************************MAİN VİDEO */
              <div ref={_wrapper} className={styles.mainVideoWrapper}>
                <div className={styles.elementsContainer}>
                  {_renderOnEndedItem()}
                </div>
                <video
                  ref={_mainVideo}
                  id="fullvideo"
                  autoPlay
                  className={styles.borderVideo}
                  style={{
                    display: onCanPlay ? 'flex' : 'none',
                    zIndex: 99
                  }}
                  onTimeUpdate={(item) => {
                    console.log('devam', item.currentTarget.currentTime)
                  }}
                  onCanPlay={() => {
                    setOnCanPlay(true)
                  }}
                  onEnded={() => {
                    if (_mainVideo.current) {
                      if (isAIRedirect(videoNode.action)) {
                        window.location.href = videoNode.action.redirectUrl
                      } else {
                        setRenderActions(videoNode.action)
                      }
                    }
                  }}
                >
                  <source type="video/mp4" />
                </video>
                <div
                  className={[styles.videoTopNav, styles.blackGradient].join(
                    ' '
                  )}
                >
                  <div className={styles.buttonBackground}>
                    <button
                      style={{
                        width: '20px',
                        height: '1px'
                      }}
                      onClick={() => {
                        disableVideo()
                      }}
                    ></button>
                  </div>
                </div>
              </div>
            )
            /****************************** */
          }
        </div>
      )}
    </>
  )
}
