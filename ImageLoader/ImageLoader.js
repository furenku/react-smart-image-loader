import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import AspectRatio from 'react-aspect-ratio';

import styleAspectRatio from 'react-aspect-ratio/aspect-ratio.css'

import Lightbox from 'react-image-lightbox';
import styles from './ImageLoader.scss';

const proptypes = {
  // src: PropTypes.string.isRequired,
  // ratio: PropTypes.number.isRequired
};

const defaultProps = {
  containerStyles: {},
  imageStyles: {},
  // transitionTime: 0,
  // transitionTimingFunction: 'ease-in',
  width: 300,
  circleCrop: false,
  lightbox: false,
  backgroundSize: 'cover',
  backgroundPosition: 'center'
};


export default class ImageLoader extends React.Component {

  constructor(props) {
    
    super(props);
    
    this.state = {
      loaded: {},
      photoIndex: 0,
      isOpen: false,
    };

    this.aspectRatioPreview = React.createRef();
    this.aspectRatioLoaded = React.createRef();

  }


  componentDidMount() {

    let img = new Image();
    
    if( this.props.src.includes('cloudinary')) {
      
      img.src = this.createImageSrc(this.props.src,{
        width:8,
        circleCrop: this.props.circleCrop
      });
      
    }
    
    img.onload = () => {
      
      this.imageLoadHandler(img, 1, () => {
        

        let element = ReactDOM.findDOMNode(this.aspectRatioPreview.current);
      
        if( !! element) {
          element.style.backgroundImage = 'url(' + img.src + ')';
        }

        
        
        let imgThumb = new Image(); 
        
        if( !! this.aspectRatioLoaded.current ) {

          
          let params = {}
          
          
          if( !! this.props.height ) {
            
            params['height'] = this.props.height
            
          }
          
          let elementWidth = parseInt(this.aspectRatioLoaded.current.node.offsetWidth);
          let setWidth = null;

          if( ! elementWidth.isNaN  ) {
            if( elementWidth>0 ) {
              setWidth= parseInt(elementWidth * 2)
              params['width']=setWidth


              if( !! this.props.circleCrop ) {
                
                params['height'] = setWidth
                
              }

              
            }
          }
          
         
          if( !! this.props.circleCrop ) {
            
            params['circleCrop'] = this.props.circleCrop
            
          }

          

          
          imgThumb.src = this.createImageSrc(this.props.src, params ) 
        
          imgThumb.onload = () => {
            
            this.imageLoadHandler(imgThumb, 2, (img) => {
              // console.log("wtf!!!!");
              
              let elementPreview = ReactDOM.findDOMNode(this.aspectRatioPreview.current);
              let elementLoaded = ReactDOM.findDOMNode(this.aspectRatioLoaded.current);
              
              if( !! elementLoaded) {
                setTimeout(()=>{
                  elementPreview.style.display='none';
                },400)
                

                // console.log(imgThumb.src, img.src);
                
                elementLoaded.style.backgroundImage = 'url(' + img.src + ')';
              }
                                        
              
            })
            
          }


        }
      
      })

    }

  
  }


  createImageSrc = ( imageSrc, params ) => {
    
    if( imageSrc.includes("cloudinary")) {
      let imagePathRoot = imageSrc.split("/upload/")[0];
      let imagePublicId = imageSrc.split("/upload/")[1];

      let paramString = "";
      if( !! params.width ) {

          paramString += "w_" + params.width;
          
      } 

      if( !! params.height && !! params.width ) {

          paramString += ",h_" + params.height;
          
      } 
      if( !! params.height && ! params.width ) {

          paramString += "h_" + params.height;
          
      } 

      if( ! params.width && ! params.height ) {

          paramString += "w_" + 600;

      }
    
      if( !! params.circleCrop ) {
        paramString+=',c_fill,r_max'
      }

      // imageSrc = imagePath + 'w_100/' + basename
      imageSrc = imagePathRoot+ '/upload/'+paramString+'/' + imagePublicId

    }
    return imageSrc



  } 


  imageLoadHandler(img, status, callback) {

    const { transitionTime, transitionTimingFunction } = this.props;

    switch( status ) {
      case 1:
        this.setState({
          status: 1,
          loaded: {
            // transitionDuration: 0,
            // opacity: '1',
            // transitionProperty: 'opacity',
            // transitionDuration: `${transitionTime}s`,
            // transitionTimingFunction,
            visibility: 'visible',
          },
        });
        break;
      case 2:
        this.setState({
          status: 2
        });
        break;
    }

    

    callback(img)

  }

  render() {

    const { photoIndex, isOpen } = this.state;

    const {
      placeholderImgUrl,
      src,
      images
    } = this.props;
    const bgImage = placeholderImgUrl && `url(${placeholderImgUrl})`;
    const { loaded } = this.state;

    let loadingClassNames = "Loading";
    let loadedClassNames = "Loaded";
    loadingClassNames += this.state.status == 2 ? " Hide" : "";
    loadedClassNames += this.state.status != 1 ? "" : " Hide";
    
    return (
      <div className="ImageLoader"
        style={Object.assign(
          {},
          {
            // opacity: 0,
            visibility: 'hidden',
            overflow: 'hidden',
            // backgroundColor: '#eee'
          },
          loaded
        )}
      >
        
        <AspectRatio className={ loadedClassNames } ref={this.aspectRatioLoaded} ratio={this.props.ratio}
          style={{
            background: 'no-repeat center center',
            backgroundSize: this.props.backgroundSize, 
            backgroundOrigin: 'content-box',
            backgroundPosition: this.props.backgroundPosition
        }}
        onClick={() => this.setState({ isOpen: true })}
        />
        <AspectRatio className={ loadingClassNames } ref={this.aspectRatioPreview} ratio={this.props.ratio}
          style={{
            background: 'no-repeat center center',
            backgroundSize: this.props.backgroundSize, 
            backgroundOrigin: 'content-box',
            backgroundPosition: 'center'
        }}
        // onClick={() => this.setState({ isOpen: true })}
        />
        {isOpen && this.props.lightbox && (
        <Lightbox
         mainSrc={images[photoIndex]}
         nextSrc={ photoIndex < images.length - 1 && images.length > 1 ? images[(photoIndex + 1) % images.length] : null }
         prevSrc={ photoIndex > 0 && images.length > 1 ? images[(photoIndex - 1) % images.length] : null }
         animationOnKeyInput={true}
         onCloseRequest={() => this.setState({ isOpen: false })}
         onMovePrevRequest={() =>
           this.setState({
             photoIndex: (photoIndex + images.length - 1) % images.length,
           })
         }
         onMoveNextRequest={() =>
           this.setState({
             photoIndex: (photoIndex + 1) % images.length,
           })
         }
        />
        )}

      </div>
    );
  }
}

ImageLoader.propTypes = proptypes;
ImageLoader.defaultProps = defaultProps;


