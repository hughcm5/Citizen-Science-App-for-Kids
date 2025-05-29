import React from 'react';

/*Import components from react-bootstrap */
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
//import banner-science from ./banner-science.png; // Tell webpack this JS file uses this image

function Homepage() {
  return (
    <div className="banner-science" >

    <section style ={{
        
    }}
    >
          <img className="banner-science" style={{float: "right", width:'30%', height:'auto', paddihg:'10%', marginTop:'10px'}}
                src='./assets/images/banner-science.png'  
                alt="banner-science by Ideogram"/> 
        <Container fluid 
        style={{
                  
                    }}
        >

            <Container className="content" 
                
                >
                 

                <h1 style={{fontSize: '50px', padding:'1.5%', color:'black',

                }} >Citizen Science App for Kids</h1>
                
                                                    
         
                <Row style={{backgroundColor:'#86adde80', borderRadius: '20px',
                    
                }}>
                    

                    <Col md={9} 
                    >   
                    <Container
                      >
                        
                    
                        <p style={{fontSize:'17px', margin:'1.2%'}}> 
                            Science is best learned in a hands-on environment, and 
                            children enjoy engaging learning activities. The Citizen Science 
                            App aims to provide K-12 youth the ability to participate in citizen 
                            science projects administered by educators, so children can 
                            meaningfully contribute and gain experience in scientific research. 
                            This cross-platform application allows educators to use an admin website 
                            to facilitate and create science projects. The application will also be 
                            available as a phone application for students to gather data and analyze 
                            results. This meaningful application will allow students to conduct science 
                            experiments and research in ways that will benefit their education for 
                            long term and short term curriculum. 
                            <br /> <br />
                        
                            The citizen science application hopes to allow citizen scientists anywhere in the 
                            world to participate in projects that enhance their education. Furthermore, 
                            educators are allowed to administer projects by monitoring results, and 
                            ensuring that the science projects are open to everyone in a collaborative 
                            environment through the use of technology. This cross-platform application 
                            will include database functionality designed to improve collaboration, 
                            project opportunities, and sharing of field data. Students can explore 
                            different forms of discovery in their scientific outcomes and strengthen 
                            their trust and understanding of the scientific process. The educators 
                            and admins are given the tools through the admin website to support and 
                            create scientific projects for members of the K-12 district(s) so each 
                            student can access and engage in scientific discovery. 
                        </p>
                        </Container>
                    </Col>
                </Row>
            </Container>
        </Container>
    </section>
    </div>
  )
}
export default Homepage