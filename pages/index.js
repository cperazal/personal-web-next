import Head from 'next/head'
import {createClient} from 'contentful'
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useContext, useEffect, useState } from 'react';
import ContextApp from '../context';

export async function getStaticProps() {

  const client = createClient({
    space: process.env.NEXT_PUBLIC_CONTENTFUL_ID_SPACE,
    accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN
  })

  const response = await client.getEntries({
    content_type: 'personal_information'
  })

  const response2 = await client.getEntries({
    content_type: 'software'
  })


  return {
    props: {
      personal_data_c: response.items,
      software: response2.items
    }, 
    revalidate: 10,
  }
}

export default function Home({personal_data_c, software}) {

  const {locale} = useContext(ContextApp);
  const [personal_data, setPersonalData] = useState(personal_data_c)

  useEffect(() => {
    if(locale){
      getPersonalData();
    }
  }, [locale]);


  const getPersonalData = async () => {

    const client = createClient({
      space: process.env.NEXT_PUBLIC_CONTENTFUL_ID_SPACE,
      accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN
    });

    const response = await client.getEntries({
      content_type: 'personal_information', locale: locale
    });

    setPersonalData(response.items);

  }


  return (
    <>
        <Head>        
            <link rel="stylesheet" href="css/icomoon.css" /> 
        </Head>
        <div style={{display: 'flex', justifyContent: 'right'}}>
          <ul className="ftco-social mt-3">
              <motion.li  whileHover={{scale: 1.7,transition: {duration: .2}}}>
                <a title="Github" href={personal_data[0].fields.github} target="_blank" rel="noreferrer"><span className="icon-github"></span></a>
              </motion.li>
              <motion.li  whileHover={{scale: 1.7,transition: {duration: .2}}}>
                <a title="Linkedin" href={personal_data[0].fields.linkedin} target="_blank" rel="noreferrer"><span className="icon-linkedin"></span></a>
              </motion.li>
              <motion.li  whileHover={{scale: 1.7,transition: {duration: .2}}}>
                <a title="Facebook" href={personal_data[0].fields.facebook} target="_blank" rel="noreferrer"><span className="icon-facebook"></span></a>
              </motion.li>
              <motion.li  whileHover={{scale: 1,transition: {duration: .2}}}>
                <a title="Twitter" href={personal_data[0].fields.twitter} target="_blank" rel="noreferrer"><span className="icon-twitter"></span></a> 
              </motion.li>
          </ul>
        </div>
        <div className="hero-wrap js-fullheight mt-4"  data-stellar-background-ratio="0.5">
          {/* style={{backgroundImage: "url(images/bg_1.jpg)"}} */}
          <div className="overlay"></div>
          <div className="js-fullheight d-flex justify-content-center align-items-center">
            <div className="col-md-8 text text-center">
              <div className="img mb-4" style={{backgroundImage: `url(${personal_data[0].fields.foto.fields.file.url})`}} ></div>
              <div className="desc">
                <h2 className="subheading"><b>{(locale === 'es-419') ? 'Hola, mi nombre es': 'Hi, my name is'}</b></h2>
                <h1 className="mb-4 text-secondary">{personal_data[0].fields.nombre}</h1>
                <p className="mb-4">{personal_data[0].fields.descripcion}</p>
                
              </div>
              <div className="col-md-12 pt-4">
                <ul className="list-inline list-icons">
                  {
                    (software.map((soft, index) => {
                      return (
                        <Link href="/skills" key={index}>
                          <motion.li key={index} className="list-inline-item cursor-pointer" whileHover={{
                            scale: 1.5,
                            transition: {
                              duration: .2
                            }
                          }}>
                              <div 
                                className="dev-icon" 
                                style={{backgroundImage: `url(${soft.fields.url_icono})`}} 
                                title={soft.fields.nombre}>
                              </div>
                          </motion.li>
                        </Link>
                      )
                    }))
                  }
                </ul>
              </div>
            </div>
          </div>
        </div>
    </>
  )
}
